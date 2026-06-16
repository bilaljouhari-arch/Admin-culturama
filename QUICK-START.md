# 🚀 Quick Start - Pousser sur GitHub en 5 min

## Étape 1: Clone ton repo (ou ouvre le dossier existant)

```bash
cd ~/projects
git clone https://github.com/bilaljouhari-arch/Admin-culturama.git
cd Admin-culturama
```

---

## Étape 2: Crée la structure des dossiers

```bash
mkdir -p css
mkdir -p js
```

---

## Étape 3: Ajoute les fichiers (depuis /mnt/user-data/outputs)

Copie ces fichiers à la **racine** du repo:
- `index.html`
- `config.example.js`
- `.gitignore`
- `.env.example`
- `README.md` (renomme Admin-culturama-README.md)
- `SECURITY.md`
- `STRUCTURE.md`

Copie dans le dossier **`css/`**:
- `style.css`

Copie dans le dossier **`js/`**:
- `auth.js`
- `app.js`
- `utils.js`

### Via terminal (plus rapide):

```bash
# Copie tous les fichiers (adapte le chemin)
cp ~/Downloads/*.js css/ 2>/dev/null || true
cp ~/Downloads/*.css css/ 2>/dev/null || true
cp ~/Downloads/index.html .
cp ~/Downloads/config.example.js .
cp ~/Downloads/.gitignore .
cp ~/Downloads/.env.example .
cp ~/Downloads/README.md README.md
```

---

## Étape 4: Crée et configure `config.js`

```bash
# Copie le template
cp config.example.js config.js

# Ouvre config.js et remplis:
# 1. SUPABASE_CONFIG.url = ta URL Supabase
# 2. SUPABASE_CONFIG.anonKey = ta clé Supabase
```

**Où trouver tes clés Supabase:**
- https://app.supabase.com
- Sélectionne ton projet
- Settings → API → Project URL & Anon Key
- Copie-colle dans config.js

---

## Étape 5: Vérifier .gitignore

```bash
# Vérifie que config.js ne sera PAS commité
cat .gitignore | grep config.js
# Output: config.js (= bon!)

# Double-vérification
git check-ignore config.js
# Output: config.js (= bon!)
```

---

## Étape 6: Push sur GitHub

```bash
# Ajoute tous les fichiers (sauf config.js grâce à .gitignore)
git add .

# Commit
git commit -m "feat: Panel admin Culturama avec auth Supabase ultra-sécurisé"

# Push
git push origin main
```

**Vérification:** Va sur GitHub → Admin-culturama
- Tu dois voir tous les fichiers SAUF `config.js` ✅
- C'est normal, c'est voulu! 🔒

---

## Étape 7: Active GitHub Pages (optionnel)

Si tu veux héberger sur GitHub Pages:

1. Va sur **Settings** du repo
2. Clique sur **Pages** (left sidebar)
3. Sélectionne **Branch:** `main` / **Folder:** `/ (root)`
4. Clique **Save**

Ton panel sera accessible à:
```
https://bilaljouhari-arch.github.io/Admin-culturama
```

---

## Étape 8: Crée un utilisateur Supabase

1. Va sur https://app.supabase.com
2. Sélectionne ton projet
3. **Authentication** → **Users** → **Invite user**
4. Email: `bilal@culturama.com`
5. Crée un mot de passe fort
6. Clique **Send Invite**

---

## Étape 9: Teste le login

### Local:
```bash
# Lance un serveur local
python3 -m http.server 8000

# Ouvre http://localhost:8000
```

### Sur GitHub Pages:
```
https://bilaljouhari-arch.github.io/Admin-culturama
```

Login:
- Email: `bilal@culturama.com`
- Password: le mot de passe que tu as créé
- ✅ Accès au dashboard!

---

## 🎉 C'est fait!

Tu as maintenant:
- ✅ Panel admin ultra-sécurisé
- ✅ Auth Supabase intégrée
- ✅ Config jamais exposée (git ignore)
- ✅ Hébergé sur GitHub (Pages optionnel)
- ✅ Code moderne et facile à étendre

---

## 📋 Troubleshooting

### "Cannot read property 'createClient'"
→ Vérife que Supabase JS lib s'est bien chargée (check console)

### "Invalid login credentials"
→ L'utilisateur n'existe pas dans Supabase. Va sur https://app.supabase.com et crée-le

### "Module not found"
→ Vérife que tes fichiers sont bien dans les bons dossiers (css/, js/)

### Config.js n'est pas chargé
→ Check que config.js n'est PAS dans .gitignore (il doit rester local!)

---

## 🔐 Rappel Sécurité

**JAMAIS**:
- ❌ Ne pousse `config.js` sur GitHub
- ❌ Ne partage pas tes clés Supabase
- ❌ Ne log les mots de passe/tokens

**TOUJOURS**:
- ✅ Utilise .gitignore pour les secrets
- ✅ Regenerate les clés si exposées
- ✅ Use HTTPS (GitHub Pages = HTTPS par défaut)

---

**Questions?** Check README.md ou SECURITY.md pour plus de détails.

Happy coding! 🚀
