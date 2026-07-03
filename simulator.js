/* =============================================
   BALINAISA SIMULATOR — Logic
   ============================================= */

const WEBHOOK_URL = 'https://charlusminus.app.n8n.cloud/webhook/balinaisa-simulateur';

// State
let currentStep = 0;
let uploadedFile = null;
let uploadedDataURL = null;
let profile = null; // 'particulier' | 'pro'

/* =============================================
   HERO → SIMULATOR
   ============================================= */
function startSimulator() {
  document.getElementById('hero').classList.add('hidden');
  document.getElementById('simulator').classList.remove('hidden');
  document.getElementById('cta-widget')?.classList.add('hidden');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function backToHome() {
  document.getElementById('simulator').classList.add('hidden');
  document.getElementById('hero').classList.remove('hidden');
  document.getElementById('cta-widget')?.classList.remove('hidden');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function widgetClick() {
  const hero = document.getElementById('hero');
  if (!hero.classList.contains('hidden')) {
    startSimulator();
  } else {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}

/* =============================================
   FILE UPLOAD
   ============================================= */
function handleFileUpload(input) {
  const file = input.files[0];
  if (!file) return;

  const MAX_MB = 8;
  const errEl = document.getElementById('upload-error');
  if (file.size > MAX_MB * 1024 * 1024) {
    errEl.textContent = `Image trop lourde (${(file.size / 1024 / 1024).toFixed(1)} Mo) — max ${MAX_MB} Mo`;
    errEl.classList.remove('hidden');
    input.value = '';
    return;
  }
  errEl.classList.add('hidden');

  uploadedFile = file;
  const reader = new FileReader();
  reader.onload = e => {
    const img = new Image();
    img.onload = () => {
      const MAX_DIM = 1200;
      let { width, height } = img;
      if (width > MAX_DIM || height > MAX_DIM) {
        if (width >= height) { height = Math.round(height * MAX_DIM / width); width = MAX_DIM; }
        else { width = Math.round(width * MAX_DIM / height); height = MAX_DIM; }
      }
      const canvas = document.createElement('canvas');
      canvas.width = width; canvas.height = height;
      canvas.getContext('2d').drawImage(img, 0, 0, width, height);
      uploadedDataURL = canvas.toDataURL('image/jpeg', 0.85);

      const zone = document.getElementById('upload-zone');
      const inner = document.getElementById('upload-zone-inner');
      const preview = document.getElementById('preview-img');
      inner.classList.add('hidden');
      preview.src = uploadedDataURL;
      preview.classList.remove('hidden');
      zone.classList.add('has-file');
      document.getElementById('btn-step1-next').disabled = false;
      applyStickies();
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
}

// Camera/gallery buttons only on mobile (tablet/phone). On desktop the
// drop zone stays the single import CTA — no redundant button.
document.addEventListener('DOMContentLoaded', () => {
  const actions = document.getElementById('upload-actions');
  if (!actions) return;
  const isMobile = /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent)
    || (navigator.maxTouchPoints > 0 && matchMedia('(pointer: coarse)').matches);
  if (isMobile) actions.classList.remove('hidden');
});

// Drag & drop
document.addEventListener('DOMContentLoaded', () => {
  const zone = document.getElementById('upload-zone');
  if (!zone) return;
  zone.addEventListener('dragover', e => { e.preventDefault(); zone.style.borderColor = 'var(--primary)'; });
  zone.addEventListener('dragleave', () => { zone.style.borderColor = ''; });
  zone.addEventListener('drop', e => {
    e.preventDefault();
    zone.style.borderColor = '';
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      const input = document.getElementById('file-input');
      const dt = new DataTransfer();
      dt.items.add(file);
      input.files = dt.files;
      handleFileUpload(input);
    }
  });
});

/* =============================================
   STICKY ACTIONS
   ============================================= */
function applyStickies() {
  const setSticky = (stepId, active) => {
    const panel   = document.getElementById(`step-${stepId}`);
    const actions = panel?.querySelector('.step-actions');
    if (!actions) return;
    actions.classList.toggle('is-sticky', active);
    panel.classList.toggle('has-sticky-bar', active);
  };
  setSticky(1, !!uploadedDataURL);
}

/* =============================================
   STEP NAVIGATION
   ============================================= */
function goToStep(step) {
  document.querySelectorAll('.step-panel').forEach(p => p.classList.add('hidden'));
  document.getElementById(`step-${step}`).classList.remove('hidden');
  updateStepNav(step);
  updateProgressBar(step);
  currentStep = step;

  if (step === 2) populateLeadForm();

  applyStickies();
  window.scrollTo({ top: 60, behavior: 'smooth' });
}

function updateStepNav(step) {
  document.querySelectorAll('.step-item').forEach(el => {
    const s = parseInt(el.dataset.step);
    el.classList.remove('active', 'done');
    if (s === step) el.classList.add('active');
    else if (s < step) el.classList.add('done');
  });
}

function updateProgressBar(step) {
  const pct = { 1: 33, 2: 66, 3: 100 }[step] || 33;
  document.getElementById('progress-bar').style.width = pct + '%';
}

/* =============================================
   STEP 2 — LEAD FORM
   ============================================= */
function populateLeadForm() {
  const recap = document.getElementById('lead-product-recap');
  if (!recap) return;
  if (!uploadedDataURL) { recap.innerHTML = ''; return; }
  recap.innerHTML = `
    <div class="lead-recap-card">
      <div class="lead-recap-info">
        <p class="lead-recap-name">Votre espace est prêt</p>
        <p class="lead-recap-mat">L'IA sélectionne le mobilier en teck Balinaisa adapté et génère votre simulation.</p>
      </div>
      <div class="lead-recap-photo">
        <img src="${uploadedDataURL}" alt="Votre espace">
        <span>Votre espace</span>
      </div>
    </div>
  `;
}

/* =============================================
   PROFILE — particulier / pro
   ============================================= */
function selectProfile(value) {
  profile = value;
  document.querySelectorAll('#profile-toggle .profile-btn').forEach(b => {
    const active = b.dataset.profile === value;
    b.classList.toggle('active', active);
    b.setAttribute('aria-pressed', active ? 'true' : 'false');
  });

  const companyGroup = document.getElementById('company-group');
  const companyInput = document.getElementById('f-company');
  const isPro = value === 'pro';
  companyGroup.classList.toggle('hidden', !isPro);
  companyInput.required = isPro;
  if (!isPro) companyInput.value = '';

  document.getElementById('profile-error')?.classList.add('hidden');
}

/* =============================================
   STEP 2 — SUBMIT
   ============================================= */
async function submitLead(e) {
  e.preventDefault();

  // Profil obligatoire (particulier / pro)
  if (!profile) {
    document.getElementById('profile-error')?.classList.remove('hidden');
    document.getElementById('profile-toggle')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    return;
  }

  const btn = document.getElementById('btn-submit-lead');
  btn.disabled = true;
  btn.innerHTML = '<span>Envoi en cours…</span>';

  const firstName = document.getElementById('f-firstname').value.trim();
  const lastName  = document.getElementById('f-lastname').value.trim();
  const company   = document.getElementById('f-company').value.trim();

  // photo_base64 : image redimensionnée (~1200px, JPEG 0.85 → ~200-400 Ko), assez
  // légère pour le body du webhook. Utilisée par l'agent décor IA (step_6) pour
  // analyser l'espace et sélectionner le mobilier Balinaisa.
  const payload = {
    first_name: firstName,
    last_name:  lastName,
    name:       `${firstName} ${lastName}`,
    email:      document.getElementById('f-email').value.trim(),
    phone:      document.getElementById('f-phone').value.trim(),
    intent:     document.getElementById('f-intent').value,
    profile:    profile, // 'particulier' | 'pro'
    is_pro:     profile === 'pro',
    company:    profile === 'pro' ? company : null,
    client_note: (document.getElementById('f-note')?.value || '').trim() || null,
    photo_base64: uploadedDataURL || null,
    source:     'simulateur-balinaisa',
  };

  try {
    await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  } catch (_) {}

  goToStep(3);
}

/* =============================================
   RESET
   ============================================= */
function resetSimulator() {
  uploadedFile = null;
  uploadedDataURL = null;
  profile = null;

  document.getElementById('preview-img').classList.add('hidden');
  document.getElementById('preview-img').src = '';
  document.getElementById('upload-zone-inner').classList.remove('hidden');
  document.getElementById('upload-zone').classList.remove('has-file');
  document.getElementById('btn-step1-next').disabled = true;
  const noteEl = document.getElementById('f-note');
  if (noteEl) noteEl.value = '';

  const form = document.getElementById('lead-form');
  if (form) form.reset();
  document.querySelectorAll('#profile-toggle .profile-btn').forEach(b => {
    b.classList.remove('active');
    b.setAttribute('aria-pressed', 'false');
  });
  const companyGroup = document.getElementById('company-group');
  const companyInput = document.getElementById('f-company');
  if (companyGroup) companyGroup.classList.add('hidden');
  if (companyInput) companyInput.required = false;
  document.getElementById('profile-error')?.classList.add('hidden');

  const btn = document.getElementById('btn-submit-lead');
  if (btn) {
    btn.disabled = false;
    btn.innerHTML = `Lancer ma simulation gratuite
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>`;
  }

  goToStep(1);
}
