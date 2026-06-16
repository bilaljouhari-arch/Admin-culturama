/**
 * Logique principale du panel Admin Culturama - CRUD complet v3
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
      const ok = await auth.init();
      if (!ok) { this.showLoginPage(); return; }
      this.supabase = auth.supabase;
      this.showMainPanel();
      this.setupEventListeners();
    } catch (err) {
      console.error('Erreur init:', err);
      showToast('Erreur initialisation', 'error');
    }
  }

  showLoginPage() {
    document.getElementById('app').innerHTML = [
      '<div class="login-screen"><div class="login-box">',
      '<div class="login-logo"><div class="logo-icon">🎭</div>',
      '<div><h1>Culturama</h1><p>Admin Panel</p></div></div>',
      '<form id="login-form">',
      '<div class="form-group"><label>Email</label>',
      '<input type="email" id="email" value="bilal.jouhari@gmail.com" required></div>',
      '<div class="form-group"><label>Mot de passe</label>',
      '<input type="password" id="password" placeholder="••••••••" required></div>',
      '<div id="login-error" class="error-message"></div>',
      '<button type="submit" class="btn btn-primary btn-block">Se connecter</button>',
      '</form></div></div>',
    ].join('');
    document.getElementById('login-form').addEventListener('submit', e => this.handleLogin(e));
  }

  async handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    try {
      const result = await auth.login(email, password);
      if (result.success) {
        showToast('Connecté!', 'success');
        this.supabase = auth.supabase;
        this.showMainPanel();
        this.setupEventListeners();
      }
    } catch (err) {
      document.getElementById('login-error').textContent = err.message;
      showToast(err.message, 'error');
    }
  }

  showMainPanel() {
    const user = auth.getUser();
    const email = user ? user.email : 'Admin';
    document.getElementById('app').innerHTML = [
      '<div class="layout">',
      '<aside class="sidebar">',
      '<div class="sidebar-header"><h2>Culturama</h2><p>' + email + '</p></div>',
      '<nav class="sidebar-nav">',
      '<button class="nav-btn active" data-view="dashboard">📊 Dashboard</button>',
      '<button class="nav-btn" data-view="evenements">🎪 Événements</button>',
      '<button class="nav-btn" data-view="articles">📰 Articles</button>',
      '<button class="nav-btn" data-view="artistes">🎤 Artistes</button>',
      '<button class="nav-btn" data-view="festivals">🎭 Festivals</button>',
      '<button class="nav-btn" data-view="annuaire">📋 Annuaire</button>',
      '<button class="nav-btn" data-view="ateliers">🎨 Ateliers</button>',
      '</nav>',
      '<div class="sidebar-footer">',
      '<button id="logout-btn" class="btn btn-secondary btn-block">Déconnexion</button>',
      '</div></aside>',
      '<main class="main-content">',
      '<header class="main-header"><h1 id="page-title">Dashboard</h1>',
      '<div class="header-actions"><span class="user-info">' + email + '</span></div></header>',
      '<div class="main-body"><div id="content"></div></div>',
      '</main></div>',
      '<div id="modal-container"></div>',
    ].join('');
    this.showDashboard();
  }

  async showDashboard() {
    const content = document.getElementById('content');
    content.innerHTML = '<div class="dashboard"><h2>Bienvenue 🎭</h2><p>Chargement...</p></div>';
    try {
      const tables = ['evenements', 'articles', 'artistes', 'festivals', 'annuaire', 'ateliers'];
      const labels = ['Événements', 'Articles', 'Artistes', 'Festivals', 'Annuaire', 'Ateliers'];
      const counts = await Promise.all(
        tables.map(t => this.supabase.from(t).select('id', { count: 'exact', head: true }))
      );
      let cards = '';
      counts.forEach((r, i) => {
        cards += '<div class="stat-card">';
        cards += '<div class="stat-number">' + (r.count || 0) + '</div>';
        cards += '<div class="stat-label">' + labels[i] + '</div>';
        cards += '</div>';
      });
      content.innerHTML = [
        '<div class="dashboard">',
        '<h2>Bienvenue au panel Admin Culturama! 🎭</h2>',
        '<p>Sélectionne une section dans le menu pour commencer.</p>',
        '<div class="stats-grid">' + cards + '</div>',
        '</div>',
      ].join('');
    } catch(e) {
      content.innerHTML = '<div class="dashboard"><p style="color:red">Erreur: ' + e.message + '</p></div>';
    }
  }

  setupEventListeners() {
    document.querySelectorAll('.nav-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        const view = e.target.dataset.view;
        const title = e.target.textContent.trim().replace(/^./, '').trim();
        document.getElementById('page-title').textContent = title;
        this.showView(view);
      });
    });
    document.getElementById('logout-btn').addEventListener('click', () => this.handleLogout());
  }

  getCRUDConfig(view) {
    const configs = {
      evenements: {
        label: 'Événement', labelPlural: 'Événements',
        cols: ['titre', 'lieu', 'date_debut', 'date_fin'],
        colLabels: ['Titre', 'Lieu', 'Date début', 'Date fin'],
        fields: [
          { name: 'titre', label: 'Titre', type: 'text', required: true },
          { name: 'description', label: 'Description', type: 'textarea' },
          { name: 'date_debut', label: 'Date début', type: 'datetime-local' },
          { name: 'date_fin', label: 'Date fin', type: 'datetime-local' },
          { name: 'lieu', label: 'Lieu', type: 'text' },
          { name: 'image_url', label: 'URL image', type: 'url' },
        ]
      },
      articles: {
        label: 'Article', labelPlural: 'Articles',
        cols: ['titre', 'auteur', 'date_publication'],
        colLabels: ['Titre', 'Auteur', 'Date publication'],
        fields: [
          { name: 'titre', label: 'Titre', type: 'text', required: true },
          { name: 'auteur', label: 'Auteur', type: 'text' },
          { name: 'contenu', label: 'Contenu', type: 'textarea' },
          { name: 'date_publication', label: 'Date publication', type: 'datetime-local' },
          { name: 'image_url', label: 'URL image', type: 'url' },
        ]
      },
      artistes: {
        label: 'Artiste', labelPlural: 'Artistes',
        cols: ['nom', 'genre'],
        colLabels: ['Nom', 'Genre'],
        fields: [
          { name: 'nom', label: 'Nom', type: 'text', required: true },
          { name: 'genre', label: 'Genre musical', type: 'text' },
          { name: 'bio', label: 'Bio', type: 'textarea' },
          { name: 'photo_url', label: 'URL photo', type: 'url' },
        ]
      },
      festivals: {
        label: 'Festival', labelPlural: 'Festivals',
        cols: ['nom', 'lieu', 'date_debut', 'date_fin'],
        colLabels: ['Nom', 'Lieu', 'Date début', 'Date fin'],
        fields: [
          { name: 'nom', label: 'Nom', type: 'text', required: true },
          { name: 'description', label: 'Description', type: 'textarea' },
          { name: 'date_debut', label: 'Date début', type: 'datetime-local' },
          { name: 'date_fin', label: 'Date fin', type: 'datetime-local' },
          { name: 'lieu', label: 'Lieu', type: 'text' },
          { name: 'image_url', label: 'URL image', type: 'url' },
        ]
      },
      annuaire: {
        label: 'Contact', labelPlural: 'Annuaire',
        cols: ['nom', 'specialite', 'ville', 'telephone', 'email'],
        colLabels: ['Nom', 'Spécialité', 'Ville', 'Téléphone', 'Email'],
        fields: [
          { name: 'nom', label: 'Nom', type: 'text', required: true },
          { name: 'specialite', label: 'Spécialité', type: 'text' },
          { name: 'ville', label: 'Ville', type: 'text' },
          { name: 'telephone', label: 'Téléphone', type: 'tel' },
          { name: 'email', label: 'Email', type: 'email' },
          { name: 'site_web', label: 'Site web', type: 'url' },
          { name: 'description', label: 'Description', type: 'textarea' },
          { name: 'photo_url', label: 'URL photo', type: 'url' },
        ]
      },
      ateliers: {
        label: 'Atelier', labelPlural: 'Ateliers',
        cols: ['titre', 'intervenant', 'lieu', 'date_debut', 'prix'],
        colLabels: ['Titre', 'Intervenant', 'Lieu', 'Date', 'Prix (MAD)'],
        fields: [
          { name: 'titre', label: 'Titre', type: 'text', required: true },
          { name: 'intervenant', label: 'Intervenant', type: 'text' },
          { name: 'description', label: 'Description', type: 'textarea' },
          { name: 'date_debut', label: 'Date début', type: 'datetime-local' },
          { name: 'date_fin', label: 'Date fin', type: 'datetime-local' },
          { name: 'lieu', label: 'Lieu', type: 'text' },
          { name: 'prix', label: 'Prix (MAD)', type: 'number' },
          { name: 'places_max', label: 'Places max', type: 'number' },
          { name: 'image_url', label: 'URL image', type: 'url' },
        ]
      },
    };
    return configs[view] || null;
  }

  showView(view) {
    if (view === 'dashboard') { this.showDashboard(); return; }
    const config = this.getCRUDConfig(view);
    if (config) this.showCRUD(view, config);
  }

  async showCRUD(table, config) {
    const content = document.getElementById('content');
    content.innerHTML = [
      '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1rem">',
      '<h2>' + config.labelPlural + '</h2>',
      '<button class="btn btn-primary" id="btn-add">+ Ajouter</button>',
      '</div>',
      '<div id="crud-table">Chargement...</div>',
    ].join('');
    document.getElementById('btn-add').addEventListener('click', () => {
      this.showModal(table, config, null);
    });
    await this.loadTable(table, config);
  }

  fmtVal(val) {
    if (!val) return '-';
    if (typeof val === 'string' && val.length > 10 && val.includes('T')) {
      const d = new Date(val);
      if (!isNaN(d)) return d.toLocaleDateString('fr-FR');
    }
    return escapeHtml(String(val)).substring(0, 60);
  }

  async loadTable(table, config) {
    const container = document.getElementById('crud-table');
    if (!container) return;
    try {
      const { data, error } = await this.supabase
        .from(table).select('*').order('created_at', { ascending: false });
      if (error) throw error;
      if (!data || data.length === 0) {
        const lbl = config.label.toLowerCase();
        container.innerHTML = '<div style="text-align:center;padding:2rem;color:#666">Aucun ' + lbl + '.<br><br>Clique sur &quot;+ Ajouter&quot; pour commencer.</div>';
        return;
      }
      let html = '<table style="width:100%;border-collapse:collapse;background:white;border-radius:8px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.1)">';
      html += '<thead><tr style="background:#f8f9fa;border-bottom:2px solid #dee2e6">';
      config.colLabels.forEach(l => {
        html += '<th style="padding:12px 16px;text-align:left;font-weight:600;color:#495057">' + l + '</th>';
      });
      html += '<th style="padding:12px 16px;text-align:right">Actions</th>';
      html += '</tr></thead><tbody>';
      data.forEach(row => {
        html += '<tr style="border-bottom:1px solid #f0f0f0" data-id="' + row.id + '">';
        config.cols.forEach(c => {
          html += '<td style="padding:12px 16px;color:#333">' + this.fmtVal(row[c]) + '</td>';
        });
        const btnStyle = 'border:none;padding:6px 12px;border-radius:4px;cursor:pointer;font-size:13px';
        html += '<td style="padding:12px 16px;text-align:right;white-space:nowrap">';
        html += '<button class="btn-edit" data-id="' + row.id + '" style="' + btnStyle + ';background:#0d6efd;color:white;margin-right:6px">✏️ Modifier</button>';
        html += '<button class="btn-delete" data-id="' + row.id + '" style="' + btnStyle + ';background:#dc3545;color:white">🗑️ Supprimer</button>';
        html += '</td></tr>';
      });
      html += '</tbody></table>';
      container.innerHTML = html;
      container.querySelectorAll('.btn-edit').forEach(btn => {
        btn.addEventListener('click', () => {
          const row = data.find(r => r.id === btn.dataset.id);
          this.showModal(table, config, row);
        });
      });
      container.querySelectorAll('.btn-delete').forEach(btn => {
        btn.addEventListener('click', async () => {
          if (!confirm('Supprimer ce ' + config.label.toLowerCase() + ' ?')) return;
          const { error } = await this.supabase.from(table).delete().eq('id', btn.dataset.id);
          if (error) { showToast('Erreur: ' + error.message, 'error'); return; }
          showToast(config.label + ' supprimé ✓', 'success');
          await this.loadTable(table, config);
        });
      });
    } catch(e) {
      container.innerHTML = '<p style="color:red">Erreur: ' + e.message + '</p>';
    }
  }

  buildField(f, row) {
    const s = 'width:100%;padding:8px 12px;border:1px solid #ddd;border-radius:6px;font-size:14px;box-sizing:border-box';
    let val = '';
    if (row) {
      if (f.type === 'datetime-local' && row[f.name]) {
        try { val = new Date(row[f.name]).toISOString().slice(0, 16); } catch(e) { val = ''; }
      } else {
        val = escapeHtml(row[f.name] || '');
      }
    }
    const lbl = '<label style="display:block;margin-bottom:4px;font-weight:500;color:#444;font-size:14px">' + f.label + (f.required ? ' *' : '') + '</label>';
    let input;
    if (f.type === 'textarea') {
      const tv = row ? escapeHtml(row[f.name] || '') : '';
      input = '<textarea name="' + f.name + '" rows="4" style="' + s + ';font-family:inherit;resize:vertical">' + tv + '</textarea>';
    } else {
      input = '<input type="' + f.type + '" name="' + f.name + '" value="' + val + '"' + (f.required ? ' required' : '') + ' style="' + s + '">';
    }
    return '<div style="margin-bottom:1rem">' + lbl + input + '</div>';
  }

  showModal(table, config, row) {
    const isEdit = !!row;
    const modal = document.getElementById('modal-container');
    const title = (isEdit ? 'Modifier ' : 'Ajouter ') + config.label;
    const submitTxt = isEdit ? 'Mettre à jour' : 'Créer';
    let formFields = '';
    config.fields.forEach(f => { formFields += this.buildField(f, row); });
    const btnRow = [
      '<div style="display:flex;gap:10px;justify-content:flex-end;margin-top:1.5rem">',
      '<button type="button" id="modal-cancel" style="padding:10px 20px;border:1px solid #ddd;background:white;border-radius:6px;cursor:pointer">Annuler</button>',
      '<button type="submit" style="padding:10px 20px;background:#0d6efd;color:white;border:none;border-radius:6px;cursor:pointer;font-weight:500">' + submitTxt + '</button>',
      '</div>',
    ].join('');
    const hdr = [
      '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1.5rem">',
      '<h3 style="margin:0;font-size:1.2rem">' + title + '</h3>',
      '<button id="modal-close" style="background:none;border:none;font-size:1.5rem;cursor:pointer;color:#666">×</button>',
      '</div>',
    ].join('');
    const inner = [
      '<div style="background:white;border-radius:12px;padding:2rem;max-width:520px;width:100%;',
      'max-height:90vh;overflow-y:auto;box-shadow:0 20px 60px rgba(0,0,0,0.3)">',
      hdr,
      '<form id="modal-form">' + formFields + btnRow + '</form>',
      '</div>',
    ].join('');
    const overlay = [
      '<div style="position:fixed;inset:0;background:rgba(0,0,0,0.5);display:flex;',
      'align-items:center;justify-content:center;z-index:1000;padding:1rem">',
      inner,
      '</div>'    ].join('');
    modal.innerHTML = overlay;
    const close = () => { modal.innerHTML = ''; };
    document.getElementById('modal-close').addEventListener('click', close);
    document.getElementById('modal-cancel').addEventListener('click', close);
    document.getElementById('modal-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const fd = new FormData(e.target);
      const data = {};
      config.fields.forEach(f => {
        const v = fd.get(f.name);
        data[f.name] = (v === '' || v === null) ? null : v;
      });
      try {
        let err;
        if (isEdit) {
          ({ error: err } = await this.supabase.from(table).update(data).eq('id', row.id));
        } else {
          ({ error: err } = await this.supabase.from(table).insert([data]));
        }
        if (err) throw err;
        showToast(config.label + (isEdit ? ' mis a jour' : ' cree') + ' OK', 'success');
        close();
        await this.loadTable(table, config);
      } catch(err2) {
        showToast('Erreur: ' + err2.message, 'error');
      }
    });
  }

  async handleLogout() {
    try {
      await auth.logout();
      showToast('Deconnecte OK', 'success');
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
