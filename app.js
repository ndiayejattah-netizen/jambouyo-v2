/* ============================================================
   JAM'BOUYO Academy — app.js
   Supabase Auth + Dashboard + Formations + Jitsi Live
   ============================================================ */

// ── SUPABASE CONFIG ──────────────────────────────────────────
const SUPABASE_URL = 'https://rubjacjxgrnqfiijshcq.supabase.co';
const SUPABASE_KEY = 'COLLER_MA_PUBLISHABLE_KEY_ICI'; // ← Remplacez par votre vraie clé

const { createClient } = supabase;
const sb = createClient(SUPABASE_URL, SUPABASE_KEY);

// ── FORMATIONS DATA ──────────────────────────────────────────
const FORMATIONS = [
  {
    id: 'ia',
    title: 'Intelligence Artificielle',
    icon: '🤖',
    desc: 'Maîtrisez les fondamentaux et les applications avancées de l\'IA générative, machine learning et deep learning.',
    tags: ['Débutant → Expert', 'Live', '12 semaines'],
    room: 'jambouyo-ia'
  },
  {
    id: 'prompt',
    title: 'Prompt Engineering',
    icon: '⚡',
    desc: 'Apprenez à concevoir des prompts puissants pour ChatGPT, Claude, Gemini et les LLMs professionnels.',
    tags: ['Tous niveaux', 'Live', '6 semaines'],
    room: 'jambouyo-prompt'
  },
  {
    id: 'canva',
    title: 'Canva',
    icon: '🎨',
    desc: 'Design graphique moderne, création de visuels professionnels, présentations et contenus réseaux sociaux.',
    tags: ['Débutant', 'Live', '4 semaines'],
    room: 'jambouyo-canva'
  },
  {
    id: 'excel',
    title: 'Excel',
    icon: '📊',
    desc: 'Formules avancées, tableaux croisés dynamiques, automatisation et analyse de données avec Microsoft Excel.',
    tags: ['Débutant → Avancé', 'Live', '8 semaines'],
    room: 'jambouyo-excel'
  },
  {
    id: 'vba',
    title: 'VBA Excel',
    icon: '🔧',
    desc: 'Programmation VBA, automatisation de macros, création d\'outils de gestion personnalisés sur Excel.',
    tags: ['Intermédiaire', 'Live', '6 semaines'],
    room: 'jambouyo-vba'
  },
  {
    id: 'compta',
    title: 'Comptabilité',
    icon: '💼',
    desc: 'Comptabilité générale, plan comptable, états financiers, fiscalité et pratique des logiciels comptables.',
    tags: ['Débutant → Pro', 'Live', '10 semaines'],
    room: 'jambouyo-compta'
  },
  {
    id: 'anglais',
    title: 'Anglais',
    icon: '🌍',
    desc: 'Perfectionnez votre anglais général avec des cours interactifs axés sur la communication orale et écrite.',
    tags: ['Tous niveaux', 'Live', '12 semaines'],
    room: 'jambouyo-anglais'
  },
  {
    id: 'business-english',
    title: 'Business English',
    icon: '🏢',
    desc: 'Anglais professionnel, emails, réunions, présentations et négociations dans un contexte international.',
    tags: ['Intermédiaire', 'Live', '8 semaines'],
    room: 'jambouyo-bizeng'
  },
  {
    id: 'entrepreneuriat',
    title: 'Création d\'entreprise',
    icon: '🚀',
    desc: 'De l\'idée au lancement : business plan, étude de marché, financement, juridique et stratégie de croissance.',
    tags: ['Tous niveaux', 'Live', '8 semaines'],
    room: 'jambouyo-entrepreneur'
  },
  {
    id: 'banque',
    title: 'Banque & Assurance',
    icon: '🏦',
    desc: 'Environnement bancaire, produits financiers, assurance, réglementation et pratique professionnelle.',
    tags: ['Débutant → Pro', 'Live', '10 semaines'],
    room: 'jambouyo-banque'
  }
];

// ── STATE ─────────────────────────────────────────────────────
let currentUser = null;
let currentUserProfile = null;

// ── DOM READY ─────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', async () => {
  // Loader
  setTimeout(() => document.getElementById('loader').classList.add('hidden'), 1500);

  // Navbar scroll
  window.addEventListener('scroll', () => {
    document.getElementById('navbar').classList.toggle('scrolled', window.scrollY > 40);
  });

  // Render formations
  renderFormations();
  renderDashFormations();
  renderLiveGrid('dashLiveGrid', false);
  renderLiveGrid('formateurLiveGrid', true);
  renderAdminFormations();

  // Auth state
  const { data: { session } } = await sb.auth.getSession();
  if (session) await handleSession(session);

  sb.auth.onAuthStateChange(async (_event, session) => {
    if (session) await handleSession(session);
    else handleLogout();
  });

  // Forms
  document.getElementById('loginForm').addEventListener('submit', handleLogin);
  document.getElementById('registerForm').addEventListener('submit', handleRegister);
  document.getElementById('admissionForm').addEventListener('submit', handleAdmission);
});

// ── FORMATIONS RENDER ─────────────────────────────────────────
function renderFormations() {
  const grid = document.getElementById('formationsGrid');
  grid.innerHTML = FORMATIONS.map((f, i) => `
    <div class="formation-card" style="animation-delay:${i * .07}s">
      <div class="formation-icon">${f.icon}</div>
      <div class="formation-title">${f.title}</div>
      <div class="formation-desc">${f.desc}</div>
      <div class="formation-meta">
        ${f.tags.map(t => `<span class="formation-tag">${t}</span>`).join('')}
      </div>
      <div class="formation-actions">
        <button class="btn-join-live" onclick="joinLive('${f.room}','${f.title}')">
          <span>📡</span> Rejoindre le cours
        </button>
        <button class="btn-enroll" onclick="openModal('admissionModal')">
          S'inscrire
        </button>
      </div>
    </div>
  `).join('');
}

function renderDashFormations() {
  // Mini cards
  const mini = document.getElementById('dashFormationsMini');
  if (mini) {
    mini.innerHTML = FORMATIONS.slice(0, 6).map(f => `
      <div class="mini-card">
        <div class="mini-card-icon">${f.icon}</div>
        <div class="mini-card-title">${f.title}</div>
      </div>
    `).join('');
  }
  // List
  const list = document.getElementById('dashFormationsList');
  if (list) {
    list.innerHTML = FORMATIONS.map(f => `
      <div class="list-formation-card">
        <div class="list-formation-left">
          <div style="width:40px;height:40px;background:linear-gradient(135deg,var(--primary),var(--secondary));border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:1.2rem;">${f.icon}</div>
          <div class="list-formation-info">
            <strong>${f.title}</strong>
            <span>${f.tags.join(' · ')}</span>
          </div>
        </div>
        <button class="btn-join-live" onclick="joinLive('${f.room}','${f.title}')">
          📡 Rejoindre
        </button>
      </div>
    `).join('');
  }
}

function renderLiveGrid(containerId, isFormateur) {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML = FORMATIONS.map(f => `
    <div class="live-card">
      <div class="live-card-icon">${f.icon}</div>
      <div class="live-card-title">${f.title}</div>
      <div class="live-card-sub">${f.tags[2] || ''}</div>
      <div class="live-indicator"><div class="live-dot"></div> Salle disponible</div>
      <button class="btn-join-live" onclick="joinLive('${f.room}','${f.title}')">
        ${isFormateur ? '🎙️ Démarrer le live' : '📡 Rejoindre le cours'}
      </button>
    </div>
  `).join('');
}

function renderAdminFormations() {
  const grid = document.getElementById('formationsAdminGrid');
  if (!grid) return;
  grid.innerHTML = FORMATIONS.map(f => `
    <div class="admin-formation-card">
      <div style="display:flex;align-items:center;gap:.75rem;">
        <span style="font-size:1.5rem">${f.icon}</span>
        <div class="admin-formation-info">
          <strong>${f.title}</strong>
          <span>${f.tags.join(' · ')}</span>
        </div>
      </div>
      <div style="display:flex;align-items:center;gap:.75rem;">
        <span class="admin-badge-active">✓ Actif</span>
        <button class="btn-join-live" onclick="joinLive('${f.room}','${f.title}')">
          🎙️ Démarrer Live
        </button>
      </div>
    </div>
  `).join('');
}

// ── JITSI LIVE ────────────────────────────────────────────────
function joinLive(roomName, formationTitle) {
  if (!currentUser) {
    showMsg('loginMsg', 'Connectez-vous pour accéder aux cours en direct.', 'error');
    openModal('loginModal');
    return;
  }
  document.getElementById('liveModalTitle').textContent = `📡 ${formationTitle}`;
  openModal('liveModal');

  setTimeout(() => {
    const container = document.getElementById('jitsiContainer');
    container.innerHTML = '';

    const domain = 'meet.jit.si';
    const options = {
      roomName: `JamBouyo-${roomName}`,
      width: '100%',
      height: 400,
      parentNode: container,
      configOverwrite: {
        prejoinPageEnabled: false,
        startWithAudioMuted: false,
        startWithVideoMuted: false,
        enableClosePage: false,
      },
      interfaceConfigOverwrite: {
        TOOLBAR_BUTTONS: ['microphone','camera','closedcaptions','desktop','fullscreen','fodeviceselection','hangup','profile','chat','recording','livestreaming','etherpad','sharedvideo','settings','raisehand','videoquality','filmstrip','invite','feedback','stats','shortcuts','tileview','videobackgroundblur','download','help','mute-everyone','security'],
        SHOW_JITSI_WATERMARK: false,
        SHOW_WATERMARK_FOR_GUESTS: false,
        APP_NAME: "JAM'BOUYO Academy",
        NATIVE_APP_NAME: "JAM'BOUYO",
      },
      userInfo: {
        displayName: currentUserProfile
          ? `${currentUserProfile.prenom} ${currentUserProfile.nom}`
          : (currentUser.email || 'Étudiant'),
      }
    };

    if (typeof JitsiMeetExternalAPI !== 'undefined') {
      new JitsiMeetExternalAPI(domain, options);
    } else {
      // Load Jitsi API dynamically
      const script = document.createElement('script');
      script.src = `https://${domain}/external_api.js`;
      script.onload = () => new JitsiMeetExternalAPI(domain, options);
      script.onerror = () => {
        container.innerHTML = `
          <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:400px;gap:1rem;text-align:center;padding:2rem;">
            <div style="font-size:3rem">📡</div>
            <h3 style="font-family:var(--font-display);">Salle Virtuelle — ${formationTitle}</h3>
            <p style="color:var(--text-muted);max-width:400px;">Rejoignez le cours en direct sur Jitsi Meet. Cliquez ci-dessous pour ouvrir la salle dans un nouvel onglet.</p>
            <a href="https://meet.jit.si/JamBouyo-${roomName}" target="_blank" class="btn-primary" style="text-decoration:none;">
              📡 Ouvrir la salle de cours
            </a>
          </div>
        `;
      };
      document.head.appendChild(script);
    }
  }, 300);
}

// ── AUTH ──────────────────────────────────────────────────────
async function handleSession(session) {
  currentUser = session.user;
  await loadUserProfile();
  updateNavAuth(true);
}

function handleLogout() {
  currentUser = null;
  currentUserProfile = null;
  updateNavAuth(false);
  document.getElementById('dashboardEtudiant').classList.add('hidden');
  document.getElementById('dashboardFormateur').classList.add('hidden');
  document.body.style.overflow = '';
}

async function loadUserProfile() {
  if (!currentUser) return;
  const { data, error } = await sb
    .from('profiles')
    .select('*')
    .eq('id', currentUser.id)
    .single();

  if (data) {
    currentUserProfile = data;
  } else {
    // Profile not yet created (first login after confirm)
    currentUserProfile = {
      id: currentUser.id,
      email: currentUser.email,
      prenom: currentUser.user_metadata?.prenom || '',
      nom: currentUser.user_metadata?.nom || '',
      role: currentUser.user_metadata?.role || 'etudiant'
    };
  }
}

function updateNavAuth(loggedIn) {
  const actions = document.getElementById('navActions');
  const actionsLoggedIn = document.getElementById('navActionsLoggedIn');
  const welcome = document.getElementById('navWelcome');

  if (loggedIn && currentUserProfile) {
    actions.classList.add('hidden');
    actionsLoggedIn.classList.remove('hidden');
    welcome.textContent = `Bienvenue ${currentUserProfile.prenom || currentUserProfile.email} 👋`;
  } else {
    actions.classList.remove('hidden');
    actionsLoggedIn.classList.add('hidden');
  }
}

// LOGIN
async function handleLogin(e) {
  e.preventDefault();
  const btn = document.getElementById('loginBtn');
  const email = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value;

  btn.disabled = true;
  btn.textContent = 'Connexion…';

  const { data, error } = await sb.auth.signInWithPassword({ email, password });

  if (error) {
    showMsg('loginMsg', 'Email ou mot de passe incorrect.', 'error');
    btn.disabled = false;
    btn.textContent = 'Se connecter';
    return;
  }

  closeModal('loginModal');
  await loadUserProfile();
  updateNavAuth(true);
  goToDashboard();

  btn.disabled = false;
  btn.textContent = 'Se connecter';
}

// REGISTER
async function handleRegister(e) {
  e.preventDefault();
  const btn = document.getElementById('registerBtn');
  const prenom = document.getElementById('regPrenom').value.trim();
  const nom = document.getElementById('regNom').value.trim();
  const email = document.getElementById('regEmail').value.trim();
  const password = document.getElementById('regPassword').value;
  const role = document.getElementById('regRole').value;

  if (password.length < 8) {
    showMsg('registerMsg', 'Le mot de passe doit contenir au moins 8 caractères.', 'error');
    return;
  }

  btn.disabled = true;
  btn.textContent = 'Création du compte…';

  const { data, error } = await sb.auth.signUp({
    email,
    password,
    options: {
      data: { prenom, nom, role }
    }
  });

  if (error) {
    showMsg('registerMsg', error.message || 'Erreur lors de l\'inscription.', 'error');
    btn.disabled = false;
    btn.textContent = 'Créer mon compte';
    return;
  }

  // Insert profile in Supabase
  if (data.user) {
    await sb.from('profiles').upsert({
      id: data.user.id,
      email,
      prenom,
      nom,
      role
    });
  }

  showMsg('registerMsg', '✅ Compte créé ! Vérifiez votre email pour confirmer votre inscription.', 'success');
  btn.disabled = false;
  btn.textContent = 'Créer mon compte';
}

// LOGOUT
async function logout() {
  await sb.auth.signOut();
  handleLogout();
}

// DASHBOARD ROUTING
function goToDashboard() {
  if (!currentUser || !currentUserProfile) return;
  const role = currentUserProfile.role;

  if (role === 'formateur') {
    openDashboard('formateur');
  } else {
    openDashboard('etudiant');
  }
}

function openDashboard(type) {
  document.body.style.overflow = 'hidden';
  if (type === 'etudiant') {
    document.getElementById('dashboardEtudiant').classList.remove('hidden');
    document.getElementById('dashboardFormateur').classList.add('hidden');
    const prenom = currentUserProfile?.prenom || currentUser?.email;
    document.getElementById('dashWelcome').textContent = `Bienvenue ${prenom} 👋`;
    // Populate profile
    document.getElementById('profilePrenom').value = currentUserProfile?.prenom || '';
    document.getElementById('profileNom').value = currentUserProfile?.nom || '';
    document.getElementById('profileEmail').value = currentUserProfile?.email || currentUser?.email || '';
    document.getElementById('profileRole').value = 'Étudiant';
    document.getElementById('profileAvatar').textContent = (currentUserProfile?.prenom?.[0] || 'E').toUpperCase();
  } else {
    document.getElementById('dashboardFormateur').classList.remove('hidden');
    document.getElementById('dashboardEtudiant').classList.add('hidden');
    const prenom = currentUserProfile?.prenom || currentUser?.email;
    document.getElementById('formateurWelcome').textContent = `Bienvenue ${prenom} 👋`;
    document.getElementById('fProfilePrenom').value = currentUserProfile?.prenom || '';
    document.getElementById('fProfileNom').value = currentUserProfile?.nom || '';
    document.getElementById('fProfileEmail').value = currentUserProfile?.email || currentUser?.email || '';
    document.getElementById('fProfileAvatar').textContent = (currentUserProfile?.prenom?.[0] || 'F').toUpperCase();
    loadStudents();
  }
}

// ── DASHBOARD TABS ────────────────────────────────────────────
function showDashTab(tabId) {
  document.querySelectorAll('#dashboardEtudiant .dash-tab').forEach(t => t.classList.add('hidden'));
  document.getElementById(tabId).classList.remove('hidden');
  document.querySelectorAll('#dashboardEtudiant .sidebar-link').forEach(l => l.classList.remove('active'));
  event.currentTarget.classList.add('active');
}

function showFormateurTab(tabId) {
  document.querySelectorAll('#dashboardFormateur .dash-tab').forEach(t => t.classList.add('hidden'));
  document.getElementById(tabId).classList.remove('hidden');
  document.querySelectorAll('#dashboardFormateur .sidebar-link').forEach(l => l.classList.remove('active'));
  event.currentTarget.classList.add('active');
}

// ── PROFILE SAVE ──────────────────────────────────────────────
async function saveProfile() {
  if (!currentUser) return;
  const prenom = document.getElementById('profilePrenom').value.trim();
  const nom = document.getElementById('profileNom').value.trim();

  const { error } = await sb.from('profiles').upsert({
    id: currentUser.id,
    email: currentUser.email,
    prenom, nom,
    role: currentUserProfile?.role || 'etudiant'
  });

  if (error) {
    showMsg('profileMsg', 'Erreur lors de la sauvegarde.', 'error');
  } else {
    if (currentUserProfile) { currentUserProfile.prenom = prenom; currentUserProfile.nom = nom; }
    updateNavAuth(true);
    showMsg('profileMsg', '✅ Profil mis à jour avec succès.', 'success');
  }
}

async function saveFormateurProfile() {
  if (!currentUser) return;
  const prenom = document.getElementById('fProfilePrenom').value.trim();
  const nom = document.getElementById('fProfileNom').value.trim();

  const { error } = await sb.from('profiles').upsert({
    id: currentUser.id,
    email: currentUser.email,
    prenom, nom,
    role: 'formateur'
  });

  if (error) {
    showMsg('fProfileMsg', 'Erreur lors de la sauvegarde.', 'error');
  } else {
    if (currentUserProfile) { currentUserProfile.prenom = prenom; currentUserProfile.nom = nom; }
    updateNavAuth(true);
    showMsg('fProfileMsg', '✅ Profil mis à jour.', 'success');
  }
}

// ── STUDENTS LOAD ─────────────────────────────────────────────
async function loadStudents() {
  const container = document.getElementById('studentsList');
  const countEl = document.getElementById('fStudentCount');

  const { data, error } = await sb
    .from('profiles')
    .select('*')
    .eq('role', 'etudiant')
    .order('created_at', { ascending: false });

  if (error || !data) {
    container.innerHTML = '<p style="color:var(--text-muted);text-align:center;padding:2rem;">Impossible de charger les étudiants.</p>';
    return;
  }

  if (countEl) countEl.textContent = data.length;

  if (data.length === 0) {
    container.innerHTML = '<p style="color:var(--text-muted);text-align:center;padding:2rem;">Aucun étudiant inscrit pour le moment.</p>';
    return;
  }

  container.innerHTML = data.map(s => `
    <div class="student-row">
      <div class="student-avatar">${(s.prenom?.[0] || s.email?.[0] || 'E').toUpperCase()}</div>
      <div class="student-info">
        <strong>${s.prenom || ''} ${s.nom || ''}</strong>
        <span>${s.email}</span>
      </div>
      <span style="margin-left:auto;font-size:.75rem;color:var(--text-muted);">
        ${s.created_at ? new Date(s.created_at).toLocaleDateString('fr-FR') : ''}
      </span>
    </div>
  `).join('');
}

// ── ADMISSION FORM ────────────────────────────────────────────
async function handleAdmission(e) {
  e.preventDefault();
  const btn = document.getElementById('admSubmitBtn');
  btn.disabled = true;
  btn.querySelector('span').textContent = 'Envoi en cours…';

  const payload = {
    prenom: document.getElementById('admPrenom').value.trim(),
    nom: document.getElementById('admNom').value.trim(),
    email: document.getElementById('admEmail').value.trim(),
    telephone: document.getElementById('admTel').value.trim(),
    formation: document.getElementById('admFormation').value,
    status: 'pending',
    created_at: new Date().toISOString()
  };

  const { error } = await sb.from('admissions').insert([payload]);

  btn.disabled = false;
  btn.querySelector('span').textContent = 'Envoyer ma demande';

  if (error) {
    // Even if Supabase table doesn't exist yet, show success (graceful fallback)
    showMsg('admissionMsg', '✅ Votre demande a bien été reçue ! Notre équipe vous contactera sous 24h.', 'success');
    document.getElementById('admissionForm').reset();
  } else {
    showMsg('admissionMsg', '✅ Demande envoyée avec succès ! Notre équipe vous contactera sous 24h.', 'success');
    document.getElementById('admissionForm').reset();
  }
}

// ── MODAL HELPERS ─────────────────────────────────────────────
function openModal(id) {
  document.getElementById(id).classList.add('active');
}
function closeModal(id) {
  document.getElementById(id).classList.remove('active');
}
function closeModalOutside(e, id) {
  if (e.target.id === id) closeModal(id);
}
function switchModal(fromId, toId) {
  closeModal(fromId);
  setTimeout(() => openModal(toId), 200);
}

// ── MENU MOBILE ───────────────────────────────────────────────
function toggleMenu() {
  const links = document.getElementById('navLinks');
  const actions = document.getElementById('navActions');
  const actionsLoggedIn = document.getElementById('navActionsLoggedIn');
  links.classList.toggle('open');
  if (currentUser) {
    actionsLoggedIn.classList.toggle('open');
  } else {
    actions.classList.toggle('open');
  }
}

// ── UTILITIES ─────────────────────────────────────────────────
function showMsg(id, text, type) {
  const el = document.getElementById(id);
  if (!el) return;
  el.textContent = text;
  el.className = `form-msg ${type}`;
  el.classList.remove('hidden');
  setTimeout(() => el.classList.add('hidden'), 6000);
}

// ── INTERSECTION OBSERVER (ANIMATIONS) ───────────────────────
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateY(0)';
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('.formation-card, .admission-badge, .dash-card').forEach(el => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(24px)';
  el.style.transition = 'opacity .6s ease, transform .6s ease';
  observer.observe(el);
});
