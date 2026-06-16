# 🗄️ Setup Supabase pour Culturama Admin

Ce guide te montre exactement comment configurer Supabase et lier le panel admin.

---

## 1. Tu as déjà un projet Supabase? (Probable)

Si tu utilises Supabase pour Culturama déjà:

**Ton projet ID:** `ersrvmxqcitdyinxpbyea`  
**Ton URL:** `https://ersrvmxqcitdyinxpbyea.supabase.co`  
**Anon key:** `eyJhbGc...` (voir plus bas comment la récupérer)

Saute à l'étape 3 ↓

---

## 2. Créer un nouveau projet Supabase (si besoin)

1. Va sur https://app.supabase.com
2. Clique **+ New project**
3. **Name:** `culturama`
4. **Database password:** Crée un mot de passe fort
5. **Region:** Sélectionne la plus proche (EU-France si dispo)
6. Clique **Create new project**

⏳ Attends 2-3 minutes que ça se lance...

---

## 3. Récupère tes clés Supabase

1. Va sur https://app.supabase.com → Sélectionne ton projet
2. **Settings** (bottom left) → **API**

Tu verras:
```
Project URL: https://ersrvmxqcitdyinxpbyea.supabase.co
Anon Key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3M...
```

Copie ces 2 valeurs ↓

---

## 4. Remplis `config.js`

### Ouvre le fichier `config.js` que tu as créé

Remplis:
```javascript
export const SUPABASE_CONFIG = {
  // Colle ton URL ici
  url: 'https://ersrvmxqcitdyinxpbyea.supabase.co',
  
  // Colle ta clé ici
  anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  
  // Les autres valeurs sont bonnes par défaut
  sessionTimeout: 30 * 60 * 1000,
  maxLoginAttempts: 5,
  lockoutDuration: 15 * 60 * 1000,
};
```

✅ **Important:** Ne sauve PAS ce fichier sur GitHub!

---

## 5. Crée un utilisateur Supabase

1. Va sur https://app.supabase.com → ton projet
2. **Authentication** (left sidebar) → **Users** tab
3. Clique **Invite user** (ou **Create new user** en v2)
4. Remplis:
   - **Email:** `bilal@culturama.com` (ou ton email)
   - **Password:** Crée un mot de passe FORT
     - Minimum 8 caractères
     - Au moins 1 majuscule
     - Au moins 1 chiffre
     - Au moins 1 caractère spécial: !@#$%^&*

5. Clique **Send invite** (ou **Create user**)

✅ L'utilisateur est créé!

---

## 6. (Optionnel) Configure Row Level Security (RLS)

### C'est quoi RLS?

RLS = **Row Level Security** = des règles qui disent "seul l'admin peut voir/modifier les données"

Sans RLS: N'importe qui avec la clé Supabase peut accéder à tout!

### Comment l'activer

1. Va sur **Database** → **Tables** (left sidebar)
2. Clique sur ta table (ex: `evenements`)
3. **Auth Policies** tab
4. Clique **Create new policy**

Exemple pour autoriser SEULEMENT l'admin:

```sql
CREATE POLICY "Admin Only - Select"
ON public.evenements
FOR SELECT
USING (auth.uid() = 'REMPLACE-PAR-TON-UID');
```

### Obtenir ton UID:

1. Va sur **Authentication** → **Users**
2. Clique sur l'utilisateur `bilal@culturama.com`
3. Copie la valeur dans "User ID"

Exemple UID: `550e8400-e29b-41d4-a716-446655440000`

---

## 7. Test de sécurité

### Vérification 1: Les clés ne sont PAS dans le code public

```bash
# Vérife que config.js n'est pas sur GitHub
git ls-files | grep config.js
# Output: (rien = bon!)
```

### Vérification 2: La connexion fonctionne

1. Ouvre le panel admin (local ou GitHub Pages)
2. Login avec:
   - Email: `bilal@culturama.com`
   - Password: le mot de passe que tu as créé
3. ✅ Accès au dashboard = bon!

### Vérification 3: Supabase répond bien

Ouvre la console du navigateur (F12) et tape:

```javascript
// Dans la console browser:
import { createClient } from '@supabase/supabase-js'
const supabase = createClient(
  'https://ersrvmxqcitdyinxpbyea.supabase.co',
  'eyJhbGc...'
)
const { data: { user } } = await supabase.auth.getUser()
console.log(user)
```

Si tu vois les données de l'utilisateur = tout marche! ✅

---

## 8. Table d'authentification Supabase

Supabase crée automatiquement une table `auth.users`:

| Field | Value |
|-------|-------|
| id | Ton UID (550e8400-e29b-41d4...) |
| email | bilal@culturama.com |
| encrypted_password | (hasssé avec bcrypt) |
| created_at | 2026-06-16T... |
| last_sign_in_at | 2026-06-16T... |

✅ Le mot de passe est **hashé** avec bcrypt (impossible à déchiffrer)

---

## 9. Problèmes courants et solutions

### ❌ "Cannot find module '@supabase/supabase-js'"
**Solution:** La lib Supabase ne s'est pas chargée. Vérife que tu as internet et recharge la page.

### ❌ "Invalid login credentials"
**Solution:** L'utilisateur n'existe pas dans Supabase. Crée-le (étape 5).

### ❌ "Permission denied"
**Solution:** Ta clé Supabase n'a pas les droits. Vérife que c'est la **clé Anon**, pas la **clé Service Role**.

### ❌ "URL does not contain //"
**Solution:** Tu n'as pas copié l'URL correctement. Elle doit ressembler à:
```
https://ersrvmxqcitdyinxpbyea.supabase.co
```

### ❌ "Network error"
**Solution:** Supabase n'est peut-être pas disponible. Check:
- Es-tu connecté à internet?
- Ton VPN bloque pas Supabase?
- Supabase est-il up? (https://status.supabase.com/)

---

## 10. Changer les clés si exposées

Si JAMAIS tu as partagé ta clé Supabase par accident:

1. Va sur **Settings** → **API**
2. Clique le bouton **Regenerate** (à côté de la clé)
3. ✅ Nouvelle clé générée!
4. Remplis-la dans `config.js`

Les anciennes clés ne marchent plus.

---

## 11. Monitoring et logs

### Voir les tentatives de login

1. **Authentication** → **Users**
2. Clique sur un utilisateur
3. **Sessions** tab = voir toutes les connexions

### Voir les requêtes à la base

1. **Logs** (left sidebar) → **API**
2. Vois toutes les requêtes de ton app à Supabase

### Activer 2FA (optionnel mais recommandé)

1. **Authentication** → **Providers**
2. Scroll à **Multi-Factor Authentication**
3. Active **TOTP** (Google Authenticator)

---

## 12. Architecture sécurité

```
┌─────────────────────────────────────────────────────┐
│           Admin Panel (ton navigateur)               │
│  index.html → auth.js → config.js (tokens)          │
└────────────────────┬────────────────────────────────┘
                     │ HTTPS (chiffré)
                     ↓
┌─────────────────────────────────────────────────────┐
│              Supabase (cloud)                        │
│  ┌──────────────────────────────────────────────┐   │
│  │ Auth (PostgreSQL)                             │   │
│  │ - Hache les mots de passe avec bcrypt       │   │
│  │ - Crée les sessions tokens                  │   │
│  │ - Gère l'expiration des sessions            │   │
│  └──────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────┐   │
│  │ RLS (Row Level Security) - optionnel         │   │
│  │ - Vérifie que tu as le droit de lire/écrire │   │
│  └──────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────┐   │
│  │ Database (PostgreSQL)                        │   │
│  │ - Tables: evenements, articles, etc.        │   │
│  └──────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────┘
```

---

## Checklist finale ✅

- [ ] Compte Supabase créé
- [ ] Utilisateur créé (bilal@culturama.com + password)
- [ ] URL Supabase copiée dans config.js
- [ ] Anon Key copiée dans config.js
- [ ] config.js n'est PAS sur GitHub
- [ ] Panel admin se lance localement
- [ ] Login fonctionne
- [ ] Accès au dashboard réussi
- [ ] (Optionnel) RLS configurée
- [ ] (Optionnel) GitHub Pages activée

---

**Document mis à jour:** Juin 2026  
**Pour questions:** Voir README.md ou SECURITY.md
