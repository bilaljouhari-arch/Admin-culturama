/**
 * Logique principale du panel Admin Culturama
 */

import { auth } from './auth.js';
import { showToast, escapeHtml, debounce } from './utils.js';
import { APP_CONFIG } from '../config.js';

class AdminApp {
  constructor() {
    this.currentView = null;
    this.supabase = null;
    this.tables = {
      evenements: [],
      articles: [],
      artistes: [],
      festivals: [],
    };
  }

  /**
   * Initialiser l'app
   */
  async init() {
    try {
      // Init auth
      const isAuthenticated = await auth.init();

      if (!isAuthenticated) {
        this.showLoginPage();
        return;
      }

      // Si authentifié, afficher le panel
      this.supabase = auth.supabase;
      this.showMainPanel();
      this.setupEventListeners();
    } catch (err) {
      console.error('Erreur init:', err);
      showToast('Erreur d\'initialisation', 'error');
    }
  }

  /**
   * Afficher la page de login
   */
  showLoginPage() {
    const app = document.getElementById('app');
    app.innerHTML = `
      <div class="login-screen">
        <div class="login-box">
          <div class="login-logo">
            <div class="logo-icon">🎭</div>
            <div>
              <h1>Culturama</h1>
              <p>Admin Panel</p>
            </div>
          </div>
          <form id="login-form">
            <div class="form-group">
              <label for="email">Email</label>
              <input 
                type="email" 
                id="email" 
                placeholder="bilal@culturama.com"
                value="bilal@culturama.com"
                required
              >
            </div>
            <div class="form-group">
              <label for="password">Mot de passe</label>
              <input 
                type="password" 
                id="password" 
                placeholder="••••••••"
                required
              >
            </div>
            <div id="login-error" class="error-message"></div>
            <button type="submit" class="btn btn-primary btn-block">
              Se connecter
            </button>
          </form>
          <div class="login-hint">
            ✅ Clés Supabase stockées en localStorage
            <br>
            🔒 Jamais exposées sur le serveur
          </div>
        </div>
      </div>
    `;

    document.getElementById('login-form').addEventListener('submit', 
      e => this.handleLogin(e)
    );
  }

  /**
   * Gérer le login
   */
  async handleLogin(e) {
    e.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const errorDiv = document.getElementById('login-error');

    try {
      const result = await auth.login(email, password);
      
      if (result.success) {
        showToast('✅ Connecté!', 'success');
        this.supabase = auth.supabase;
        this.showMainPanel();
        this.setupEventListeners();
      }
    } catch (err) {
      errorDiv.textContent = err.message;
      showToast('❌ ' + err.message, 'error');
    }
  }

  /**
   * Afficher le panel principal
   */
  showMainPanel() {
    const app = document.getElementById('app');
    const user = auth.getUser();

    app.innerHTML = `
      <div class="layout">
        <aside class="sidebar">
          <div class="sidebar-header">
            <h2>Culturama</h2>
            <p>${user?.email || 'Admin'}</p>
          </div>
          
          <nav class="sidebar-nav">
            <button class="nav-btn active" data-view="dashboard">
              📊 Dashboard
            </button>
            <button class="nav-btn" data-view="evenements">
              🎪 Événements
            </button>
            <button class="nav-btn" data-view="articles">
              📰 Articles
            </button>
            <button class="nav-btn" data-view="artistes">
              🎤 Artistes
            </button>
            <button class="nav-btn" data-view="festivals">
              🎭 Festivals
            </button>
          </nav>

          <div class="sidebar-footer">
            <button id="logout-btn" class="btn btn-secondary btn-block">
              Déconnexion
            </button>
          </div>
        </aside>

        <main class="main-content">
          <header class="main-header">
            <h1 id="page-title">Dashboard</h1>
            <div class="header-actions">
              <span class="user-info">${user?.email}</span>
            </div>
          </header>

          <div class="main-body">
            <div id="content"></div>
          </div>
        </main>
      </div>

      <div id="modal-container"></div>
    `;

    // Afficher dashboard par défaut
    this.showDashboard();
  }

  /**
   * Dashboard
   */
  showDashboard() {
    const content = document.getElementById('content');
    content.innerHTML = `
      <div class="dashboard">
        <h2>Bienvenue au panel Admin Culturama! 🎭</h2>
        <p>Sélectionne une section dans le menu pour commencer.</p>
        
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-number">0</div>
            <div class="stat-label">Événements</div>
          </div>
          <div class="stat-card">
            <div class="stat-number">0</div>
            <div class="stat-label">Articles</div>
          </div>
          <div class="stat-card">
            <div class="stat-number">0</div>
            <div class="stat-label">Artistes</div>
          </div>
          <div class="stat-card">
            <div class="stat-number">0</div>
            <div class="stat-label">Festivals</div>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Setup des event listeners
   */
  setupEventListeners() {
    // Navigation
    document.querySelectorAll('.nav-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        
        const view = e.target.dataset.view;
        document.getElementById('page-title').textContent = 
          btn.textContent.split(' ').pop();
        
        this.showView(view);
      });
    });

    // Logout
    document.getElementById('logout-btn').addEventListener('click', 
      () => this.handleLogout()
    );

    // Auto-logout sur inactivité
    document.addEventListener('mousemove', () => {
      if (auth.isAuthenticated()) {
        auth.resetAutoLogout();
      }
    });
  }

  /**
   * Afficher une vue
   */
  showView(view) {
    const content = document.getElementById('content');
    
    switch(view) {
      case 'dashboard':
        this.showDashboard();
        break;
      case 'evenements':
        content.innerHTML = '<p>📊 Section Événements en construction...</p>';
        break;
      case 'articles':
        content.innerHTML = '<p>📊 Section Articles en construction...</p>';
        break;
      case 'artistes':
        content.innerHTML = '<p>📊 Section Artistes en construction...</p>';
        break;
      case 'festivals':
        content.innerHTML = '<p>📊 Section Festivals en construction...</p>';
        break;
    }
  }

  /**
   * Logout
   */
  async handleLogout() {
    try {
      await auth.logout();
      showToast('Déconnecté ✓', 'success');
      setTimeout(() => window.location.reload(), 1000);
    } catch (err) {
      showToast('Erreur logout: ' + err.message, 'error');
    }
  }
}

// Lancer l'app quand le DOM est prêt
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    const app = new AdminApp();
    app.init();
  });
} else {
  const app = new AdminApp();
  app.init();
}

export default AdminApp;
