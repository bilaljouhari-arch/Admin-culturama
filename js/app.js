/**
 * Logique principale du panel Admin Culturama - CRUD complet
 */

import { auth } from './auth.js';
import { showToast, escapeHtml } from './utils.js';

class AdminApp {
  constructor() {
    this.currentView = null;
    this.supabase = null;
  }

  async init() {
    try {
      const isAuthenticated = await auth.init();
      if (!isAuthenticated) { this.showLoginPage(); return; }
      this.supabase = auth.supabase;
      this.showMainPanel();
      this.setupEventListeners();
    } catch (err) {
      console.error('Erreur init:', err);
      showToast('Erreur d\'initialisation', 'error');
    }
  }

  showLoginPage() {
    const app = document.getElementById('app');
    app.innerHTML = `
      <div class="login-screen">
        <div class="login-box">
          <div class="login-logo">
            <div class="logo-icon">🎭</div>
            <div><h1>Culturama</h1><p>Admin Panel</p></div>
          </div>
          <form id="login-form">
            <div class="form-group">
              <label for="email">Email</label>
              <input type="email" id="email" placeholder="bilal@culturama.com" value="bilal@culturama.com" required>
            </div>
            <div class="form-group">
              <label for="password">Mot de passe</label>
              <input type="password" id="password" placeholder="••••••••" required>
            </div>
            <div id="login-error" class="error-message"></div>
            <button type="submit" class="btn btn-primary btn-block">Se connecter</button>
          </form>
          <div class="login-hint">✅ Clés Supabase stockées en localStorage<br>🔒 Jamais exposées sur le serveur</div>
        </div>
      </div>`;
    document.getElementById('login-form').addEventListener('submit', e => this.handleLogin(e));
  }

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

  showMainPanel() {
    const app = document.getElementById('app');
    const user = auth.getUser();
    app.innerHTML = `
      <div class="layout">
        <aside class="sidebar">
          <div class="sidebar-header"><h2>Culturama</h2><p>${user?.email || 'Admin'}</p></div>
          <nav class="sidebar-nav">
            <button class="nav-btn active" data-view="dashboard">📊 Dashboard</button>
            <button class="nav-btn" data-view="evenements">🎪 Événements</button>
            <button class="nav-btn" data-view="articles">📰 Articles</button>
            <button class="nav-btn" data-view="artistes">🎤 Artistes</button>
            <button class="nav-btn" data-view="festivals">🎭 Festivals</button>
          </nav>
          <div class="sidebar-footer">
            <button id="logout-btn" class="btn btn-secondary btn-block">Déconnexion</button>
          </div>
        </aside>
        <main class="main-content">
          <header class="main-header">
            <h1 id="page-title">Dashboard</h1>
            <div class="header-actions"><span class="user-info">${user?.email}</span></div>
          </header>
          <div class="main-body"><div id="content"></div></div>
        </main>
      </div>
      <div id="modal-container"></div>`;
    this.showDashboard();
  }

  async showDashboard() {
    const content = document.getElementById('content');
    content.innerHTML = `<div class="dashboard"><h2>Bienvenue au panel Admin Culturama! 🎭</h2><p>Chargement des statistiques...</p></div>`;
    try {
      const [ev, ar, art, fest] = await Promise.all([
        this.supabase.from('evenements').select('id', { count: 'exact', head: true }),
        this.supabase.from('articles').select('id', { count: 'exact', head: true }),
        this.supabase.from('artistes').select('id', { count: 'exact', head: true }),
        this.supabase.from('festivals').select('id', { count: 'exact', head: true }),
      ]);
      content.innerHTML = `
        <div class="dashboard">
          <h2>Bienvenue au panel Admin Culturama! 🎭</h2>
          <p>Sélectionne une section dans le menu pour commencer.</p>
          <div class="stats-grid">
            <div class="stat-card"><div class="stat-number">${ev.count ?? 0}</div><div class="stat-label">Événements</div></div>
            <div class="stat-card"><div class="stat-number">${ar.count ?? 0}</div><div class="stat-label">Articles</div></div>
            <div class="stat-card"><div class="stat-number">${art.count ?? 0}</div><div class="stat-label">Artistes</div></div>
            <div class="stat-card"><div class="stat-number">${fest.count ?? 0}</div><div class="stat-label">Festivals</div></div>
          </div>
        </div>`;
    } catch(e) {
      content.innerHTML = `<div class="dashboard"><h2>Dashboard</h2><p style="color:red">Erreur: ${e.message}</p></div>`;
    }
  }

  setupEventListeners() {
    document.querySelectorAll('.nav-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        const view = e.target.dataset.view;
        document.getElementById('page-title').textContent = e.target.textContent.trim().replace(/^./, '').trim();
        this.showView(view);
      });
    });
    document.getElementById('logout-btn').addEventListener('click', () => this.handleLogout());
  }

  showView(view) {
    switch(view) {
      case 'dashboard': this.showDashboard(); break;
      case 'evenements': this.showCRUD('evenements', {
        label: 'Événement', labelPlural: 'Événements',
        cols: ['titre','lieu','date_debut','date_fin'],
        colLabels: ['Titre','Lieu','Date début','Date fin'],
        fields: [
          { name:'titre', label:'Titre', type:'text', required:true },
          { name:'description', label:'Description', type:'textarea' },
          { name:'date_debut', label:'Date début', type:'datetime-local' },
          { name:'date_fin', label:'Date fin', type:'datetime-local' },
          { name:'lieu', label:'Lieu', type:'text' },
          { name:'image_url', label:'URL image', type:'url' },
        ]
      }); break;
      case 'articles': this.showCRUD('articles', {
        label: 'Article', labelPlural: 'Articles',
        cols: ['titre','auteur','date_publication'],
        colLabels: ['Titre','Auteur','Date publication'],
        fields: [
          { name:'titre', label:'Titre', type:'text', required:true },
          { name:'auteur', label:'Auteur', type:'text' },
          { name:'contenu', label:'Contenu', type:'textarea' },
          { name:'date_publication', label:'Date publication', type:'datetime-local' },
          { name:'image_url', label:'URL image', type:'url' },
        ]
      }); break;
      case 'artistes': this.showCRUD('artistes', {
        label: 'Artiste', labelPlural: 'Artistes',
        cols: ['nom','genre'],
        colLabels: ['Nom','Genre'],
        fields: [
          { name:'nom', label:'Nom', type:'text', required:true },
          { name:'genre', label:'Genre musical', type:'text' },
          { name:'bio', label:'Bio', type:'textarea' },
          { name:'photo_url', label:'URL photo', type:'url' },
        ]
      }); break;
      case 'festivals': this.showCRUD('festivals', {
        label: 'Festival', labelPlural: 'Festivals',
        cols: ['nom','lieu','date_debut','date_fin'],
        colLabels: ['Nom','Lieu','Date début','Date fin'],
        fields: [
          { name:'nom', label:'Nom', type:'text', required:true },
          { name:'description', label:'Description', type:'textarea' },
          { name:'date_debut', label:'Date début', type:'datetime-local' },
          { name:'date_fin', label:'Date fin', type:'datetime-local' },
          { name:'lieu', label:'Lieu', type:'text' },
          { name:'image_url', label:'URL image', type:'url' },
        ]
      }); break;
    }
  }

  async showCRUD(table, config) {
    const content = document.getElementById('content');
    content.innerHTML = `<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1rem">
      <h2>${config.labelPlural}</h2>
      <button class="btn btn-primary" id="btn-add">+ Ajouter</button>
    </div>
    <div id="crud-table">Chargement...</div>`;

    document.getElementById('btn-add').addEventListener('click', () => {
      this.showModal(table, config, null);
    });

    await this.loadTable(table, config);
  }

  async loadTable(table, config) {
    const container = document.getElementById('crud-table');
    if (!container) return;
    try {
      const { data, error } = await this.supabase.from(table).select('*').order('created_at', { ascending: false });
      if (error) throw error;

      if (!data || data.length === 0) {
        container.innerHTML = `<div style="text-align:center;padding:2rem;color:#666">Aucun ${config.label.toLowerCase()} pour le moment.<br><br>Clique sur "+ Ajouter" pour commencer.</div>`;
        return;
      }

      const formatVal = (val) => {
        if (!val) return '-';
        if (typeof val === 'string' && val.includes('T')) {
          const d = new Date(val);
          if (!isNaN(d)) return d.toLocaleDateString('fr-FR');
        }
        return escapeHtml(String(val)).substring(0, 60);
      };

      container.innerHTML = `
        <table style="width:100%;border-collapse:collapse;background:white;border-radius:8px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.1)">
          <thead>
            <tr style="background:#f8f9fa;border-bottom:2px solid #dee2e6">
              ${config.colLabels.map(l => `<th style="padding:12px 16px;text-align:left;font-weight:600;color:#495057">${l}</th>`).join('')}
              <th style="padding:12px 16px;text-align:right">Actions</th>
            </tr>
          </thead>
          <tbody>
            ${data.map(row => `
              <tr style="border-bottom:1px solid #f0f0f0" class="table-row" data-id="${row.id}">
                ${config.cols.map(c => `<td style="padding:12px 16px;color:#333">${formatVal(row[c])}</td>`).join('')}
                <td style="padding:12px 16px;text-align:right;white-space:nowrap">
                  <button class="btn-edit btn" data-id="${row.id}" style="background:#0d6efd;color:white;border:none;padding:6px 12px;border-radius:4px;cursor:pointer;margin-right:6px;font-size:13px">✏️ Modifier</button>
                  <button class="btn-delete btn" data-id="${row.id}" style="background:#dc3545;color:white;border:none;padding:6px 12px;border-radius:4px;cursor:pointer;font-size:13px">🗑️ Supprimer</button>
                </td>
              </tr>`).join('')}
          </tbody>
        </table>`;

      // Attach edit/delete handlers
      container.querySelectorAll('.btn-edit').forEach(btn => {
        btn.addEventListener('click', async () => {
          const row = data.find(r => r.id === btn.dataset.id);
          this.showModal(table, config, row);
        });
      });

      container.querySelectorAll('.btn-delete').forEach(btn => {
        btn.addEventListener('click', async () => {
          if (!confirm(`Supprimer ce ${config.label.toLowerCase()} ?`)) return;
          const { error } = await this.supabase.from(table).delete().eq('id', btn.dataset.id);
          if (error) { showToast('Erreur suppression: ' + error.message, 'error'); return; }
          showToast(`${config.label} supprimé ✓`, 'success');
          await this.loadTable(table, config);
        });
      });

    } catch(e) {
      container.innerHTML = `<p style="color:red">Erreur: ${e.message}</p>`;
    }
  }

  showModal(table, config, row) {
    const isEdit = !!row;
    const modal = document.getElementById('modal-container');

    const formatDateForInput = (val) => {
      if (!val) return '';
      try { return new Date(val).toISOString().slice(0, 16); } catch(e) { return ''; }
    };

    modal.innerHTML = `
      <div style="position:fixed;inset:0;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:1000;padding:1rem">
        <div style="background:white;border-radius:12px;padding:2rem;max-width:520px;width:100%;max-height:90vh;overflow-y:auto;box-shadow:0 20px 60px rgba(0,0,0,0.3)">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1.5rem">
            <h3 style="margin:0;font-size:1.2rem">${isEdit ? 'Modifier' : 'Ajouter'} ${config.label}</h3>
            <button id="modal-close" style="background:none;border:none;font-size:1.5rem;cursor:pointer;color:#666">×</button>
          </div>
          <form id="modal-form">
            ${config.fields.map(f => `
              <div style="margin-bottom:1rem">
                <label style="display:block;margin-bottom:4px;font-weight:500;color:#444;font-size:14px">${f.label}${f.required ? ' *' : ''}</label>
                ${f.type === 'textarea'
                  ? `<textarea name="${f.name}" rows="4" style="width:100%;padding:8px 12px;border:1px solid #ddd;border-radius:6px;font-family:inherit;font-size:14px;box-sizing:border-box;resize:vertical">${escapeHtml(row?.[f.name] || '')}</textarea>`
                  : `<input type="${f.type}" name="${f.name}" value="${f.type==='datetime-local' ? formatDateForInput(row?.[f.name]) : escapeHtml(row?.[f.name] || '')}" ${f.required ? 'required' : ''} style="width:100%;padding:8px 12px;border:1px solid #ddd;border-radius:6px;font-size:14px;box-sizing:border-box">`
                }
              </div>`).join('')}
            <div style="display:flex;gap:10px;justify-content:flex-end;margin-top:1.5rem">
              <button type="button" id="modal-cancel" style="padding:10px 20px;border:1px solid #ddd;background:white;border-radius:6px;cursor:pointer">Annuler</button>
              <button type="submit" style="padding:10px 20px;background:#0d6efd;color:white;border:none;border-radius:6px;cursor:pointer;font-weight:500">${isEdit ? 'Mettre à jour' : 'Créer'}</button>
            </div>
          </form>
        </div>
      </div>`;

    const closeModal = () => { modal.innerHTML = ''; };
    document.getElementById('modal-close').addEventListener('click', closeModal);
    document.getElementById('modal-cancel').addEventListener('click', closeModal);

    document.getElementById('modal-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const formData = new FormData(e.target);
      const data = {};
      config.fields.forEach(f => {
        const val = formData.get(f.name);
        data[f.name] = val === '' ? null : val;
      });

      try {
        let error;
        if (isEdit) {
          ({ error } = await this.supabase.from(table).update(data).eq('id', row.id));
        } else {
          ({ error } = await this.supabase.from(table).insert([data]));
        }
        if (error) throw error;
        showToast(`${config.label} ${isEdit ? 'mis à jour' : 'créé'} ✓`, 'success');
        closeModal();
        await this.loadTable(table, config);
      } catch(err) {
        showToast('Erreur: ' + err.message, 'error');
      }
    });
  }

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

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => { new AdminApp().init(); });
} else {
  new AdminApp().init();
}
