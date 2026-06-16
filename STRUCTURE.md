# Structure des dossiers Admin-culturama

Créer cette structure dans ton repo:

```
Admin-culturama/
├── index.html              ← Page principale
├── config.example.js       ← Template config (push this)
├── config.js               ← ⚠️ Ne JAMAIS pusher! (add to .gitignore)
├── .gitignore             ← Fichiers à ignorer
├── .env.example           ← Template variables d'env
├── README.md              ← Instructions
│
├── css/
│   └── style.css          ← Tous les styles
│
├── js/
│   ├── auth.js            ← Authentification Supabase
│   ├── app.js             ← Logique du panel
│   └── utils.js           ← Fonctions utilitaires
│
└── assets/                (optionnel)
    └── logo.svg           ← Logo Culturama
```

## 📋 Checklist pour pousher sur GitHub

1. ✅ Crée le dossier `css/` et mets-y `style.css`
2. ✅ Crée le dossier `js/` et mets-y `auth.js`, `app.js`, `utils.js`
3. ✅ Mets les autres fichiers à la racine
4. ✅ Crée `config.js` à partir de `config.example.js` (NE LE POUSSE PAS)
5. ✅ Git add, commit, push (config.js sera ignoré automatiquement)
6. ✅ Active GitHub Pages dans Settings

Voilà! 🚀
