/**
 * Configuration Supabase - TEMPLATE
 * 
 * ⚠️ IMPORTANT:
 * 1. Copie ce fichier en "config.js"
 * 2. Remplis tes clés Supabase
 * 3. Ne committe JAMAIS config.js sur GitHub
 * 
 * Où trouver tes clés:
 * - https://app.supabase.com
 * - Settings → API → Project URL & Anon Key
 */

export const SUPABASE_CONFIG = {
  // URL de ton projet Supabase
  url: 'https://YOUR_PROJECT_ID.supabase.co',
  
  // Clé Supabase publique (safe pour le client)
  anonKey: 'eyJhbGc...',
  
  // Timeouts et limites de sécurité
  sessionTimeout: 30 * 60 * 1000, // 30 minutes d'inactivité = logout
  maxLoginAttempts: 5,
  lockoutDuration: 15 * 60 * 1000, // 15 minutes
};

/**
 * Config locales
 */
export const APP_CONFIG = {
  appName: 'Culturama Admin',
  version: '1.0.0',
  environment: 'production', // ou 'development'
  
  // Toast messages duration (ms)
  toastDuration: 3000,
  
  // Auto-logout après inactivité
  enableAutoLogout: true,
};

/**
 * Validation des inputs
 */
export const VALIDATION = {
  email: {
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    maxLength: 255,
  },
  password: {
    minLength: 8,
    requireUppercase: true,
    requireNumber: true,
    requireSpecial: true,
  },
};
