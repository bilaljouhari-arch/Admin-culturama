/**
 * Authentification Supabase sécurisée
 */

import { SUPABASE_CONFIG, APP_CONFIG } from '../config.js';

class AuthManager {
  constructor() {
    this.supabase = null;
    this.user = null;
    this.sessionTimeout = null;
    this.loginAttempts = 0;
    this.isLockedOut = false;
  }

  /**
   * Initialise Supabase
   */
  async init() {
    if (!window.supabase) {
      throw new Error('Supabase JS library not loaded');
    }

    const { createClient } = window.supabase;
    this.supabase = createClient(
      SUPABASE_CONFIG.url,
      SUPABASE_CONFIG.anonKey,
      {
        auth: {
          persistSession: true,
          storageKey: 'culturama_session',
          storage: window.localStorage,
        },
      }
    );

    // Vérifier s'il y a une session existante
    const { data: { session } } = await this.supabase.auth.getSession();
    if (session) {
      this.user = session.user;
      this.resetAutoLogout();
      return true;
    }
    return false;
  }

  /**
   * Login avec email/password
   */
  async login(email, password) {
    // Check rate limiting
    if (this.isLockedOut) {
      throw new Error('Trop de tentatives. Réessaye dans 15 minutes.');
    }

    if (!this.validateEmail(email)) {
      throw new Error('Email invalide');
    }

    if (!password || password.length < 6) {
      throw new Error('Mot de passe invalide');
    }

    try {
      const { data, error } = await this.supabase.auth.signInWithPassword({
        email: email.toLowerCase().trim(),
        password: password,
      });

      if (error) {
        this.loginAttempts++;
        if (this.loginAttempts >= SUPABASE_CONFIG.maxLoginAttempts) {
          this.lockoutAccount();
        }
        throw new Error('Email ou mot de passe incorrect');
      }

      // Success
      this.user = data.user;
      this.loginAttempts = 0;
      this.isLockedOut = false;

      // Sauvegarder la session localement
      this.saveSession(data.session);

      // Démarrer auto-logout
      this.resetAutoLogout();

      return { success: true, user: this.user };
    } catch (err) {
      throw new Error(err.message || 'Erreur de connexion');
    }
  }

  /**
   * Logout
   */
  async logout() {
    try {
      await this.supabase.auth.signOut();
      this.clearSession();
      this.user = null;
      this.clearAutoLogout();
      return { success: true };
    } catch (err) {
      throw new Error('Erreur lors de la déconnexion');
    }
  }

  /**
   * Réinitialiser le timeout auto-logout
   */
  resetAutoLogout() {
    if (!APP_CONFIG.enableAutoLogout) return;

    this.clearAutoLogout();

    this.sessionTimeout = setTimeout(() => {
      console.warn('Session expirée par inactivité');
      this.logout().then(() => {
        window.location.reload();
      });
    }, SUPABASE_CONFIG.sessionTimeout);
  }

  /**
   * Annuler le timeout
   */
  clearAutoLogout() {
    if (this.sessionTimeout) {
      clearTimeout(this.sessionTimeout);
      this.sessionTimeout = null;
    }
  }

  /**
   * Verrouiller le compte après trop de tentatives
   */
  lockoutAccount() {
    this.isLockedOut = true;
    setTimeout(() => {
      this.isLockedOut = false;
      this.loginAttempts = 0;
    }, SUPABASE_CONFIG.lockoutDuration);
  }

  /**
   * Valider email
   */
  validateEmail(email) {
    return email && 
           email.length <= 255 && 
           /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  /**
   * Sauvegarder session en localStorage
   */
  saveSession(session) {
    if (session) {
      localStorage.setItem('culturama_session', JSON.stringify({
        user: session.user,
        access_token: session.access_token,
        refresh_token: session.refresh_token,
        expires_at: session.expires_at,
      }));
    }
  }

  /**
   * Effacer session
   */
  clearSession() {
    localStorage.removeItem('culturama_session');
  }

  /**
   * Obtenir l'utilisateur courant
   */
  getUser() {
    return this.user;
  }

  /**
   * Vérifier si authentifié
   */
  isAuthenticated() {
    return !!this.user;
  }
}

// Exporter une instance singleton
export const auth = new AuthManager();
