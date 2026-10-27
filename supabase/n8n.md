# n8n : enregistrer chaque appel dans Supabase

Workflow concerné : **« akno - fin d'appel »** (déclenché par le webhook Retell `call_analyzed`).
On ajoute 2 nœuds à la suite du Webhook, en parallèle de Cal.com / Brevo, pour qu'une panne Supabase ne bloque pas les emails.

## 0. Pré-requis (une fois)
1. `schema.sql` exécuté dans Supabase.
2. Une ligne dans `artisans` pour chaque client, avec son `retell_agent_id` (voir § 4).
3. **Credential n8n** (la clé ne doit JAMAIS être collée dans un chat ni en clair dans un nœud) :
   - n8n > *Credentials* > *Add credential* > **Custom Auth** ; nom : `Supabase service_role`
   - JSON (remplacez `CLE` par la clé **service_role**, Supabase > Project Settings > API Keys) :
```json
{ "headers": { "apikey": "CLE", "Authorization": "Bearer CLE" } }
```

## 1. Nœud « Trouver l'artisan » (HTTP Request)
- Méthode : `POST`
- URL : `https://VOTRE-PROJET.supabase.co/rest/v1/rpc/artisan_for_agent`
- Authentication : *Generic Credential Type* > *Custom Auth* > `Supabase service_role`
- Body (JSON) :
```json
{ "p_agent_id": "{{ $('Webhook').item.json.body.call.agent_id }}" }
```
- Réponse : l'`uuid` de l'artisan (texte). Si vide → l'agent n'est relié à aucun artisan : ajoutez un nœud *IF* qui stoppe et vous envoie une alerte.

## 2. Nœud « Enregistrer l'appel » (HTTP Request)
- Méthode : `POST`
- URL : `https://VOTRE-PROJET.supabase.co/rest/v1/calls?on_conflict=retell_call_id`
- Authentication : mêmes credentials que ci-dessus.
- Headers :
  - `Content-Type` : `application/json`
  - `Prefer` : `resolution=merge-duplicates,return=minimal` (si Retell renvoie 2 fois le webhook, pas de doublon)
- Body (JSON, *Using JSON*) — ajustez les noms de `custom_analysis_data` à ceux définis dans Retell (Post-Call Analysis) :
```json
{
  "artisan_id":       "{{ $('Trouver l\'artisan').item.json }}",
  "retell_call_id":   "{{ $('Webhook').item.json.body.call.call_id }}",
  "nom_client":       "{{ $('Webhook').item.json.body.call.call_analysis.custom_analysis_data.nom_client }}",
  "telephone_client": "{{ $('Webhook').item.json.body.call.call_analysis.custom_analysis_data.telephone_client || $('Webhook').item.json.body.call.from_number }}",
  "motif":            "{{ $('Webhook').item.json.body.call.call_analysis.custom_analysis_data.motif }}",
  "besoin_detail":    "{{ $('Webhook').item.json.body.call.call_analysis.custom_analysis_data.besoin_detail }}",
  "resume":           "{{ $('Webhook').item.json.body.call.call_analysis.call_summary }}",
  "code_postal":      "{{ $('Webhook').item.json.body.call.call_analysis.custom_analysis_data.code_postal }}",
  "adresse":          "{{ $('Webhook').item.json.body.call.call_analysis.custom_analysis_data.adresse }}",
  "email_client":     "{{ $('Webhook').item.json.body.call.call_analysis.custom_analysis_data.email_client }}",
  "rdv_date":         {{ JSON.stringify($('Webhook').item.json.body.call.call_analysis.custom_analysis_data.rdv_date || null) }},
  "type_demande":     "{{ $('Webhook').item.json.body.call.call_analysis.custom_analysis_data.type_demande }}",
  "urgence":          "{{ $('Webhook').item.json.body.call.call_analysis.custom_analysis_data.urgence ? 'urgent' : 'normal' }}",
  "raison_blocage":   "{{ $('Webhook').item.json.body.call.call_analysis.custom_analysis_data.raison_blocage }}",
  "transcript":       {{ JSON.stringify($('Webhook').item.json.body.call.transcript || '') }},
  "recording_url":    "{{ $('Webhook').item.json.body.call.recording_url }}",
  "duration":         {{ Math.round(($('Webhook').item.json.body.call.duration_ms || 0) / 1000) }},
  "statut":           "{{ $('Webhook').item.json.body.call.call_analysis.custom_analysis_data.rdv_date ? 'rdv_pris' : 'a_rappeler' }}"
}
```
Notes :
- `transcript` et `rdv_date` passent par `JSON.stringify` (guillemets, retours à la ligne, `null`).
- `rdv_date` doit être une date ISO (ex. `2026-10-29T14:30:00+01:00`) : décrivez-le ainsi dans le champ Retell, ou reprenez la date renvoyée par le nœud Cal.com.
- `urgence` : si votre champ Retell est déjà un texte `urgent`/`normal`, mettez-le directement.
- Si un RDV a été pris, ajoutez (optionnel) un 3ᵉ nœud POST `/rest/v1/appointments` avec `artisan_id`, `call_id` (`Prefer: return=representation` sur le nœud 2 pour récupérer l'`id`), `title` = motif, `client`, `start`, `end` (= start + 1 h), `adresse`.

## 3. Tester
1. *Execute workflow* avec un webhook Retell réel (bouton de test d'appel).
2. Supabase > Table Editor > `calls` : la ligne apparaît.
3. L'app ouverte : l'appel arrive tout seul (temps réel) avec un toast « Nouvel appel ».
Erreur 401 → credential faux. 400/23502 → `artisan_id` vide (agent non relié). 409 → doublon déjà géré.

## 4. Relier un agent Retell à un artisan
1. L'artisan crée son compte (Supabase > Authentication > *Add user* > *Send invitation*, avec son email).
2. Copiez son `User UID`.
3. Retell > l'agent du client > copiez l'**Agent ID** (`agent_...`).
4. SQL Editor :
```sql
insert into public.artisans (id, nom_entreprise, prenom, email, telephone, retell_agent_id)
values ('UUID-DE-L-UTILISATEUR', 'Martin Énergies', 'Julien', 'julien@exemple.fr', '04 00 00 00 00', 'agent_xxxxxxxx');
```
Un agent = un artisan. Le nœud 1 fait la correspondance automatiquement à chaque appel.
