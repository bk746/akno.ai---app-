# Akno

Application web pour artisans : dashboard, appels, agenda, assistant IA et réglages. Basée sur le prototype dans `akno-app copy/`.

## Démarrage

```bash
npm install
npm run dev
```

Ouvrir [http://localhost:3000](http://localhost:3000). Sans configuration Supabase, l’app fonctionne en **mode démo** (données fictives en local).

## Connexion Supabase (production)

1. Exécuter `supabase/schema.sql` dans le SQL Editor Supabase.
2. Copier `.env.example` vers `.env.local` et renseigner :

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre_cle_anon
```

3. Redémarrer `npm run dev`.

Voir aussi `supabase/deploy.md` et `supabase/n8n.md`.

## Structure

| Emplacement | Rôle |
|-------------|------|
| `public/akno/app.js` | Logique UI (copiée depuis `akno-app copy/app.js`) |
| `app/akno-styles.css` | Styles du prototype |
| `akno-app copy/` | Référence / maquettes / scripts de build Python |

Pour régénérer le HTML standalone du prototype : `python3 "akno-app copy/build.py"` dans ce dossier.
