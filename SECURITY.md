# 🔒 Guide Sécurité - Admin Culturama

Ce document explique comment ce panel admin est sécurisé et les meilleures pratiques à suivre.

---

## 1. Authentification Supabase

### Comment ça marche

```
User entre email/password
        ↓
✅ Validé côté client (XSS protection)
        ↓
📤 Envoyé à Supabase (HTTPS sécurisé)
        ↓
✅ Supabase valide et crée session
        ↓
💾 Session sauvegardée en localStorage
        ↓
🔑 Token stocké (non accessible depuis JavaScript malveillant)
```

### Pourquoi c'est sûr

- ✅ **Jamais de mot de passe stocké en local** - seulement les tokens
- ✅ **HTTPS obligatoire** - communication chiffrée
- ✅ **Session expiration** - auto-logout après 30 min d'inactivité
- ✅ **XSS Protection** - inputs échappés (escapeHtml())
- ✅ **Rate limiting** - max 5 tentatives login avant blocage 15 min

---

## 2. Variables sensibles (Config)

### Ne JAMAIS exposer:

❌ `VITE_SUPABASE_URL`  
❌ `VITE_SUPABASE_ANON_KEY`  
❌ Les credentials de ta base Supabase

### Comment faire:

✅ Stocke dans `.env.local` (⚠️ ajoute à .gitignore)  
✅ Charge via `import { SUPABASE_CONFIG } from './config.js'`  
✅ Vérifie .gitignore: `config.js` doit y être  
✅ Avant de pusher: `git status` → `config.js` ne doit PAS être listé

### Test de sécurité:

```bash
# Vérifie que config.js est bien ignoré
git check-ignore config.js
# Output: config.js (si tout est bon)

# Vérifie qu'il n'est pas dans le repo
git ls-files | grep config.js
# Output: (rien = bon!)
```

---

## 3. Protection contre les attaques

### XSS (Cross-Site Scripting)

**Attaque:** Injecter du JavaScript malveillant

**Protection:**
```javascript
// ❌ JAMAIS:
element.innerHTML = userInput;

// ✅ OUI:
element.textContent = escapeHtml(userInput);
```

### CSRF (Cross-Site Request Forgery)

**Attaque:** Forcer un utilisateur à faire une action sans consentement

**Protection:**
- Supabase gère les CSRF tokens automatiquement
- Toutes les requêtes passent par Supabase Auth

### SQL Injection

**Attaque:** Injecter du code SQL dans les inputs

**Protection:**
- Supabase utilise des requêtes paramétrées
- Pas de concaténation SQL

### Brute Force

**Attaque:** Essayer tous les mots de passe possibles

**Protection:**
```javascript
if (loginAttempts >= 5) {
  lockoutAccount(); // Blocage 15 minutes
}
```

---

## 4. Checklist de sécurité avant déploiement

- [ ] `config.js` est dans `.gitignore`
- [ ] `.env.local` est dans `.gitignore`
- [ ] Pas de clés Supabase hardcodées en clair dans le code
- [ ] HTTPS activé (GitHub Pages = HTTPS par défaut ✅)
- [ ] Auto-logout activé après 30 min
- [ ] XSS protection en place (escapeHtml)
- [ ] Validation des inputs côté client
- [ ] Pas de console.log() avec données sensibles
- [ ] Rate limiting activé pour login
- [ ] Session localStorage chiffré

---

## 5. Row Level Security (RLS) - À configurer dans Supabase

Pour vraiment sécuriser ta base, ajoute des règles RLS:

### Exemple: Événements visibles seulement par admin

```sql
-- Dans Supabase → SQL Editor

CREATE POLICY "Admin only" ON evenements
  FOR ALL
  USING (auth.uid() = '..your-admin-uid..');
```

### Obtenir ton UID:

1. Va sur Supabase → Authentication → Users
2. Clique sur ton utilisateur
3. Copie l'UID dans la colonne "User ID"

---

## 6. Mises à jour et maintenance

### Vérifier les vulnérabilités

```bash
# Vérifier les packages npm
npm audit

# Ou avec Yarn
yarn audit
```

### Mettre à jour Supabase

```html
<!-- Vérifie régulièrement la version -->
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@LATEST"></script>
```

---

## 7. Sauvegardes et Disaster Recovery

### Sauvegarde ta base Supabase

1. Va sur Supabase → Database → Backups
2. Crée une sauvegarde manuelle tous les mois
3. Exporte les données régulièrement

---

## 8. Logging et Monitoring

### En production, log ces événements:

✅ Tentatives de login échouées  
✅ Accès à des données sensibles  
✅ Changements de configuration  
✅ Uploads de fichiers

### À ÉVITER de logger:

❌ Mots de passe  
❌ Tokens  
❌ Clés API  
❌ Données personnelles

---

## 9. Questions fréquentes

### Q: Peut-on voler mon anon key?
**R:** Oui, c'est une clé publique. C'est normal! Supabase RLS (Row Level Security) empêche les abus.

### Q: Ma clé Supabase est exposée, que faire?
**R:** 
1. Va sur Supabase → Settings → API
2. Clique "Regenerate" pour anular la clé
3. Remplis la nouvelle clé dans `config.js`

### Q: Comment gérer les permissions utilisateur?
**R:** Avec **Supabase RLS (Row Level Security)** - voir section 5 ci-dessus.

### Q: Dois-je chiffrer les données en local?
**R:** localStorage n'est pas ultra-sûr, mais:
- Supabase gérera la sécurité côté serveur
- Pour données ultra-sensibles, chiffre avec TweetNaCl.js

---

## 10. Ressources supplémentaires

- 📚 [Supabase Security Docs](https://supabase.com/docs/guides/auth)
- 🔐 [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- 🛡️ [Securing Web Applications](https://cheatsheetseries.owasp.org/)

---

**Dernière MAJ:** Juin 2026  
**Responsable:** Bilal Jouhari
