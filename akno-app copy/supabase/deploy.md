# Mise en ligne d'Akno (Supabase + Vercel)

## 1. Créer le projet Supabase
1. https://supabase.com > *New project*. Région : **Europe (Paris / Frankfurt)** (RGPD). Notez le mot de passe de la base dans votre gestionnaire de mots de passe.
2. *SQL Editor* > *New query* > collez tout `supabase/schema.sql` > **Run**. Attendu : « Success. No rows returned ».
3. *Authentication* > *Sign In / Providers* > Email : activé. Désactivez **« Allow new users to sign up »** (seuls vos clients invités peuvent se connecter).
4. *Authentication* > *URL Configuration* :
   - Site URL : `https://VOTRE-APP.vercel.app` (à remplir après l'étape 3)
   - Redirect URLs : `https://VOTRE-APP.vercel.app/**` et `http://localhost:3000/**`
5. *Authentication* > *Emails* : traduisez les modèles « Magic Link » et « Invite » en français. Pour une vraie prod, branchez votre SMTP Brevo (*SMTP Settings*) : le SMTP par défaut est limité à quelques emails par heure.
6. *Project Settings* > *API Keys* : copiez l'**URL du projet** et la clé **anon / publishable**. La clé `service_role` ne va **que** dans n8n.

## 2. Brancher l'app
1. Ouvrez `akno-app/app.js`, lignes 3-4 :
```js
const SUPABASE_URL='https://VOTRE-PROJET.supabase.co';
const SUPABASE_ANON_KEY='VOTRE_CLE_ANON';
```
   (La clé anon est publique par nature : la sécurité vient des règles RLS du schéma.)
2. `python3 build.py` → régénère `index.html`.
3. Créez votre propre compte artisan de test (n8n.md § 4) et ouvrez `index.html` : l'écran de connexion apparaît.
   Constantes vides = mode démo (données fictives, rien n'est envoyé).

## 3. Déployer sur Vercel
1. Créez un dossier `akno-deploy/` contenant uniquement `index.html`.
2. Option simple : https://vercel.com > *Add New* > *Project* > glissez le dossier (ou poussez-le sur un dépôt GitHub et importez-le). Framework : **Other**, aucune commande de build.
3. Option ligne de commande : `npm i -g vercel` puis dans le dossier `vercel` puis `vercel --prod`.
4. Copiez l'URL obtenue dans Supabase (étape 1.4). Domaine perso (ex. `app.akno.fr`) : Vercel > *Settings* > *Domains*, puis ajoutez-le aussi dans les Redirect URLs Supabase.

## 4. Ajouter un artisan client
1. Supabase > *Authentication* > *Users* > *Invite user* (son email).
2. Insérez sa ligne `artisans` avec son `retell_agent_id` (n8n.md § 4).
3. Il reçoit l'email, clique, choisit son mot de passe ou se connecte par lien. Il ne voit que ses appels et son agenda.

## Vérifications avant le premier pilote
- Connexion par lien et par mot de passe OK sur téléphone.
- Un appel test apparaît dans l'app en moins de 10 s après la fin d'appel.
- « Rappelé », la note, l'ajout, la modification et la suppression d'un RDV sont conservés après rechargement.
- Un 2ᵉ compte test ne voit **pas** les appels du premier (test RLS).
