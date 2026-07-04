/* =============================================
   BALINAISA SIMULATOR - Logic
   ============================================= */

const WEBHOOK_URL = 'https://charlusminus.app.n8n.cloud/webhook/balinaisa-simulateur';
const TOTAL_FORM_STEPS = 4; // Photo, Profil, Coordonnées, Horizon+consent (5e = Confirmation)

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
  document.getElementById('domia')?.classList.add('hidden');
  document.getElementById('simulator').classList.remove('hidden');
  document.getElementById('cta-widget')?.classList.add('hidden');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function backToHome() {
  document.getElementById('simulator').classList.add('hidden');
  document.getElementById('hero').classList.remove('hidden');
  document.getElementById('domia')?.classList.remove('hidden');
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
    errEl.textContent = `Image trop lourde (${(file.size / 1024 / 1024).toFixed(1)} Mo · max ${MAX_MB} Mo)`;
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
// drop zone stays the single import CTA - no redundant button.
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
  updateStepsCounter(step);
  updateProgressBar(step);
  currentStep = step;

  if (step === 2) populateLeadForm();

  applyStickies();
  window.scrollTo({ top: 60, behavior: 'smooth' });
}

function updateStepsCounter(step) {
  const wrap = document.getElementById('steps-nav');
  const label = document.getElementById('steps-counter');
  if (!wrap || !label) return;
  if (step > TOTAL_FORM_STEPS) {
    wrap.classList.add('hidden');
    return;
  }
  wrap.classList.remove('hidden');
  label.textContent = `Étape ${step} / ${TOTAL_FORM_STEPS}`;
}

function updateProgressBar(step) {
  const pct = { 1: 20, 2: 40, 3: 60, 4: 80, 5: 100 }[step] || 20;
  document.getElementById('progress-bar').style.width = pct + '%';
}

/* =============================================
   STEP 2 - LEAD FORM (recap photo)
   ============================================= */
function populateLeadForm() {
  const recap = document.getElementById('lead-product-recap');
  if (!recap) return;
  if (!uploadedDataURL) { recap.innerHTML = ''; return; }
  recap.innerHTML = `
    <div class="lead-recap-card">
      <div class="lead-recap-info">
        <p class="lead-recap-name">Votre espace est prêt</p>
        <p class="lead-recap-mat">Domia sélectionne le mobilier en teck Balinaisa adapté et génère votre simulation.</p>
      </div>
      <div class="lead-recap-photo">
        <img src="${uploadedDataURL}" alt="Votre espace">
        <span>Votre espace</span>
      </div>
    </div>
  `;
}

/* =============================================
   PROFILE - particulier / pro
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

  // "Particulier" n'a besoin d'aucune autre info sur cette étape : on avance
  // directement, sans bouton "Continuer" à cliquer. "Professionnel" révèle
  // le champ entreprise et affiche le bouton (Entrée dans le champ fonctionne aussi).
  const nextBtn = document.getElementById('btn-step2-next');
  if (isPro) {
    nextBtn?.classList.remove('hidden');
    companyInput.focus();
  } else {
    nextBtn?.classList.add('hidden');
    setTimeout(() => goToStep3(), 200);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('f-company')?.addEventListener('keydown', e => {
    if (e.key === 'Enter') { e.preventDefault(); goToStep3(); }
  });
});

/* =============================================
   STEP-BY-STEP VALIDATION (Continuer)
   ============================================= */
function goToStep3() {
  // Profil obligatoire (particulier / pro)
  if (!profile) {
    document.getElementById('profile-error')?.classList.remove('hidden');
    document.getElementById('profile-toggle')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    return;
  }
  const company = document.getElementById('f-company');
  if (profile === 'pro' && company && !company.reportValidity()) return;
  goToStep(3);
}

function goToStep4() {
  const firstname = document.getElementById('f-firstname');
  const lastname  = document.getElementById('f-lastname');
  const email     = document.getElementById('f-email');
  if (!firstname.reportValidity()) return;
  if (!lastname.reportValidity()) return;
  if (!email.reportValidity()) return;
  goToStep(4);
}

/* =============================================
   STEP 4 - SUBMIT
   ============================================= */
async function submitLead(e) {
  e.preventDefault();

  // Profil obligatoire (garde-fou : déjà validé à l'étape 2)
  if (!profile) {
    goToStep(2);
    document.getElementById('profile-error')?.classList.remove('hidden');
    return;
  }

  // "Je suis juste curieux(se)" : la génération IA a un coût réel, réservée
  // aux intentions d'achat confirmées. On n'envoie rien au webhook.
  const intent = document.getElementById('f-intent').value;
  if (intent === 'curious') {
    showCuriousScreen();
    return;
  }

  const btn = document.getElementById('btn-submit-lead');
  btn.disabled = true;
  btn.innerHTML = '<span>Envoi en cours…</span>';

  const firstName = document.getElementById('f-firstname').value.trim();
  const lastName  = document.getElementById('f-lastname').value.trim();
  const company   = document.getElementById('f-company').value.trim();

  // photo_base64 : image redimensionnée (~1200px, JPEG 0.85 → ~200-400 Ko), assez
  // légère pour le body du webhook. Utilisée par l'agent décor IA pour analyser
  // l'espace et sélectionner le mobilier Balinaisa.
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

  goToStep(5);
}

/* =============================================
   RÉSULTAT ALTERNATIF - intention "curieux(se)"
   ============================================= */
function showCuriousScreen() {
  document.querySelectorAll('.step-panel').forEach(p => p.classList.add('hidden'));
  document.getElementById('step-curious').classList.remove('hidden');
  document.getElementById('steps-nav')?.classList.add('hidden');
  document.getElementById('progress-bar').style.width = '100%';
  window.scrollTo({ top: 60, behavior: 'smooth' });
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

  // Coordonnées et entreprise ne sont plus dans le <form> (réparties sur
  // plusieurs étapes) : on les vide explicitement.
  ['f-firstname', 'f-lastname', 'f-email', 'f-phone', 'f-company'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });

  const form = document.getElementById('lead-form');
  if (form) form.reset(); // vide horizon d'achat + consentement

  document.querySelectorAll('#profile-toggle .profile-btn').forEach(b => {
    b.classList.remove('active');
    b.setAttribute('aria-pressed', 'false');
  });
  const companyGroup = document.getElementById('company-group');
  const companyInput = document.getElementById('f-company');
  if (companyGroup) companyGroup.classList.add('hidden');
  if (companyInput) companyInput.required = false;
  document.getElementById('profile-error')?.classList.add('hidden');
  document.getElementById('btn-step2-next')?.classList.add('hidden');

  const btn = document.getElementById('btn-submit-lead');
  if (btn) {
    btn.disabled = false;
    btn.innerHTML = `Lancer ma simulation gratuite
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>`;
  }

  goToStep(1);
}

/* Partage du simulateur - Web Share API (mobile : WhatsApp, réseaux, iMessage…),
   repli WhatsApp Web sur desktop. */
function shareSimulator() {
  const url = 'https://charlusminus.github.io/balinaisa-simulateur/';
  const text = "J'ai découvert Domia, l'œil de Dominique : le simulateur d'aménagement extérieur en teck Balinaisa. Une photo de votre espace suffit :";
  if (navigator.share) {
    navigator.share({ title: 'Domia · Balinaisa', text: text, url: url }).catch(() => {});
  } else {
    window.open('https://wa.me/?text=' + encodeURIComponent(text + ' ' + url), '_blank', 'noopener');
  }
}
