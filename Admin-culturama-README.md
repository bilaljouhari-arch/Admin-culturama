# Admin Culturama 🎭

Panel d'administration ultra-sécurisé pour la gestion du contenu Culturama.

## 🔒 Sécurité

- ✅ Authentification Supabase (email/password)
- ✅ Session persistante (localStorage chiffré)
- ✅ Logout automatique après inactivité
- ✅ XSS protection intégrée
- ✅ CORS sécurisé
- ✅ Clés API jamais exposées au frontend
- ✅ Variables d'environnement isolées

---

## 🚀 Installation

### 1. Clone le repo
```bash
git clone https://github.com/bilaljouhari-arch/Admin-culturama.git
cd Admin-culturama
```

### 2. Configure Supabase
```bash
# Copie le fichier config exemple
cp config.example.js config.js

# Édite config.js avec tes clés Supabase
# (Ne push JAMAIS config.js sur GitHub!)
```

**Où trouver tes clés Supabase:**
- Va sur https://app.supabase.com
- Sélectionne ton projet
- Settings → API → Project URL & Anon Key
- Copie ces valeurs dans `config.js`

### 3. Crée un compte utilisateur

Dans Supabase:
1. **Authentication** → **Users** → **Invite user**
2. Email: `bilal@culturama.com` (ou autre)
3. Password: un mot de passe fort
4. Invite!

### 4. Lance localement
```bash
# Option A: Avec Python
python3 -m http.server 8000

# Option B: Avec Node.js
npx http-server

# Puis ouvre: http://localhost:8000
```

### 5. Teste le login
- Email: `bilal@culturama.com`
- Password: ton mot de passe
- ✅ Tu devrais accéder au panel!

---

## 📦 Deploy sur GitHub Pages

```bash
# Commit et push
git add .
git commit -m "feat: Panel admin Culturama avec auth Supabase"
git push origin main

# Active GitHub Pages:
# 1. Va sur Settings → Pages
# 2. Sélectionne "Deploy from a branch"
# 3. Branch: main → Folder: / (root)
# 4. Save

# Accès: https://bilaljouhari-arch.github.io/Admin-culturama
```

---

## 🔐 .gitignore (IMPORTANT!)

Le fichier `.gitignore` **doit** exclure:
```
config.js          # Ne jamais pusher tes clés!
.env               # Variables d'env sensibles
node_modules/
.DS_Store
```

---

## 📋 Structure du code

- **config.js**: Configuration Supabase (ne pas committer)
- **auth.js**: Login, logout, session management
- **app.js**: Logique du panel (événements, tables, modales)
- **utils.js**: Fonctions utilitaires (toast, validation, etc.)
- **style.css**: Design ultra-minimaliste

---

## 🔧 Variables d'environnement

Crée un fichier `.env.local` (à git ignore):
```
VITE_SUPABASE_URL=https://ersrvmxqcitdyinxpbyea.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...
```

Ou configure directement dans `config.js`.

---

## 🚨 Troubleshooting

### "Invalid login credentials"
→ Vérifie que l'utilisateur existe dans Supabase (Authentication → Users)

### "Cannot read property 'createClient'"
→ Vérifie que `config.js` est chargé avant `auth.js` dans le HTML

### Session disparaît au reload
→ Normal si le localStorage est vide. Log-in à nouveau ou check console.

---

## 📞 Support

Questions? Crée une issue sur GitHub ou contacte-moi directement.

---

**Version:** 1.0.0  
**Dernière MAJ:** Juin 2026  
**Développé par:** Bilal Jouhari
