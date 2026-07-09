/* =============================================
   BALINAISA SIMULATOR - Logic
   ============================================= */

const WEBHOOK_URL = 'https://charlusminus.app.n8n.cloud/webhook/balinaisa-simulateur';
const TOTAL_FORM_STEPS = 4; // Photo, Profil, Coordonnées, Horizon+consent (5e = Confirmation)

/* Anti-bot Cloudflare Turnstile (gratuit). Vide = désactivé (le front n'exige pas de token).
   Pour activer : coller la Site Key ci-dessous, puis configurer la vérification du token côté n8n. */
const TURNSTILE_SITEKEY = '0x4AAAAAADwDzprfOCkDePsI';
let _turnstileId = null;
function renderTurnstile() {
  if (!TURNSTILE_SITEKEY || !window.turnstile || _turnstileId !== null) return;
  const box = document.getElementById('turnstile-box');
  // iOS Safari : rendre le widget dans un conteneur encore masque (display:none)
  // produit une iframe a dimensions nulles qui ne s'affiche jamais. On attend donc
  // que la boite soit reellement visible (etape 4 affichee) avant de rendre.
  if (!box || box.offsetParent === null) return;
  try { _turnstileId = turnstile.render('#turnstile-box', { sitekey: TURNSTILE_SITEKEY, theme: 'light' }); } catch (e) {}
}
window.onTurnstileLoad = renderTurnstile;
document.addEventListener('DOMContentLoaded', renderTurnstile);
function getCaptchaToken() {
  if (!TURNSTILE_SITEKEY || !window.turnstile || _turnstileId === null) return '';
  try { return turnstile.getResponse(_turnstileId) || ''; } catch (e) { return ''; }
}
// Le token Turnstile est a usage unique : on reinitialise le widget apres un envoi ou
// sur "Refaire une simulation" pour generer un token frais (evite l'erreur duplicate).
function resetTurnstile() {
  if (!TURNSTILE_SITEKEY || !window.turnstile || _turnstileId === null) return;
  try { turnstile.reset(_turnstileId); } catch (e) {}
}

/* Tracking marketing : on capte les UTM (+ gclid/fbclid, referrer, landing) au
   PREMIER hit et on les fige en sessionStorage (first-touch). L'URL ne change pas
   quand on lance le simulateur, mais on securise ainsi reload/navigation interne.
   Ces champs partent dans le payload du lead pour etre logges dans le Sheet. */
const TRACKING_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'gclid', 'fbclid'];
const TRACKING_STORE = 'balinaisa_tracking';

function captureTracking() {
  try {
    const stored = JSON.parse(sessionStorage.getItem(TRACKING_STORE) || 'null');
    if (stored) return stored; // first-touch deja fige
    const q = new URLSearchParams(window.location.search);
    const data = {};
    TRACKING_KEYS.forEach(k => { data[k] = (q.get(k) || '').trim(); });
    data.referrer = document.referrer || '';
    data.landing_url = window.location.href;
    sessionStorage.setItem(TRACKING_STORE, JSON.stringify(data));
    return data;
  } catch (_) {
    return {};
  }
}
const TRACKING = captureTracking();

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
  document.getElementById('balinaisa-ai')?.classList.add('hidden');
  document.getElementById('balinaisa')?.classList.add('hidden');
  document.getElementById('faq')?.classList.add('hidden');
  document.getElementById('avis')?.classList.add('hidden');
  document.getElementById('simulator').classList.remove('hidden');
  document.getElementById('cta-widget')?.classList.add('hidden');
  document.getElementById('header-cta')?.classList.remove('is-visible');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function backToHome() {
  document.getElementById('simulator').classList.add('hidden');
  document.getElementById('hero').classList.remove('hidden');
  document.getElementById('balinaisa-ai')?.classList.remove('hidden');
  document.getElementById('balinaisa')?.classList.remove('hidden');
  document.getElementById('faq')?.classList.remove('hidden');
  document.getElementById('avis')?.classList.remove('hidden');
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

// Deep-link depuis le widget / le site : arriver directement sur l'import photo,
// sans l'ecran d'accueil (evite le doublon d'accroche). Declenche par ?start=1 ou #simuler.
document.addEventListener('DOMContentLoaded', () => {
  const params = new URLSearchParams(window.location.search);
  if (params.get('start') === '1' || window.location.hash === '#simuler') {
    startSimulator();
  }
});

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

  // L'etape 4 porte le widget Turnstile : on le rend une fois la boite visible
  // (rAF pour laisser le layout s'appliquer), sinon iOS Safari ne l'affiche pas.
  if (step === TOTAL_FORM_STEPS) requestAnimationFrame(renderTurnstile);

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
        <p class="lead-recap-mat">Balinaisa.ai sélectionne le mobilier en teck Balinaisa adapté et génère votre simulation.</p>
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
  const phone     = document.getElementById('f-phone');
  if (!firstname.reportValidity()) return;
  if (!lastname.reportValidity()) return;
  if (!email.reportValidity()) return;
  // Téléphone : requis + numéro plausible (international accepté). On compte les chiffres
  // en ignorant espaces, +, tirets, points et parenthèses. E.164 : 8 à 15 chiffres.
  const phoneDigits = (phone.value || '').replace(/\D/g, '');
  phone.setCustomValidity(
    phoneDigits.length >= 8 && phoneDigits.length <= 15
      ? ''
      : 'Indiquez un numéro de téléphone valide (8 à 15 chiffres, indicatif international accepté, ex. +33 6 12 34 56 78).'
  );
  if (!phone.reportValidity()) return;
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

  // "Je suis juste curieux(se)" : la génération du rendu a un coût réel, réservée
  // aux intentions d'achat confirmées. On n'envoie rien au webhook.
  const intent = document.getElementById('f-intent').value;
  if (intent === 'curious') {
    showCuriousScreen();
    return;
  }

  // Anti-bot : exigé seulement si une Site Key Turnstile est configurée.
  const captchaToken = getCaptchaToken();
  if (TURNSTILE_SITEKEY && !captchaToken) {
    document.getElementById('captcha-error')?.classList.remove('hidden');
    return;
  }
  document.getElementById('captcha-error')?.classList.add('hidden');

  const btn = document.getElementById('btn-submit-lead');
  btn.disabled = true;
  btn.innerHTML = '<span>Envoi en cours…</span>';

  const firstName = document.getElementById('f-firstname').value.trim();
  const lastName  = document.getElementById('f-lastname').value.trim();
  const company   = document.getElementById('f-company').value.trim();

  // photo_base64 : image redimensionnée (~1200px, JPEG 0.85 → ~200-400 Ko), assez
  // légère pour le body du webhook. Utilisée par l'œil de Dominique pour analyser
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
    budget:      document.getElementById('f-budget')?.value || null,
    photo_base64: uploadedDataURL || null,
    source:     'simulateur-balinaisa',
    captcha_token: captchaToken,
    ...TRACKING,
  };

  // Le webhook répond APRÈS le contrôle anti-abus (captcha + plafond). On lit le statut :
  // ok:false + reason:'limit' => l'utilisateur a atteint le nombre max de simulations.
  let blockedReason = null;
  try {
    const res = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json().catch(() => null);
    if (data && data.ok === false) blockedReason = data.reason || 'limit';
  } catch (_) { /* souci réseau : on reste optimiste et on affiche la confirmation */ }

  // Token consommé : on régénère un token frais pour une éventuelle nouvelle simulation.
  resetTurnstile();

  if (blockedReason) { showBlockedScreen(blockedReason); return; }
  goToStep(5);
}

// Écran de blocage (réutilise l'étape 5 en adaptant le message) quand la demande n'aboutit pas.
function showBlockedScreen(reason) {
  const title = document.querySelector('#step-5 .confirmation-title');
  const sub   = document.querySelector('#step-5 .confirmation-sub');
  const icon  = document.querySelector('#step-5 .confirmation-icon');
  if (reason === 'limit') {
    if (title) title.textContent = 'Votre intérêt nous honore';
    if (sub) sub.textContent = "Vous avez déjà composé plusieurs ambiances avec Balinaisa.ai, et votre enthousiasme nous touche. Pour imaginer la suite sur mesure et donner vie à votre projet, l'équipe Balinaisa se fera une joie d'échanger avec vous :";
  } else if (reason === 'daily') {
    if (title) title.textContent = 'Simulateur très sollicité';
    if (sub) sub.textContent = "Le simulateur reçoit un grand nombre de demandes en ce moment. Merci de réessayer un peu plus tard dans la journée.";
  } else {
    if (title) title.textContent = "Nous n'avons pas pu traiter votre demande";
    if (sub) sub.textContent = "Un souci est survenu lors de la validation. Merci de réessayer, ou écrivez-nous à contact@balinaisa.com.";
  }
  // Coordonnées complètes Balinaisa : affichées seulement sur l'écran de limite atteinte.
  const contact = document.getElementById('limit-contact');
  if (contact) contact.classList.toggle('hidden', reason !== 'limit');
  if (icon) icon.classList.add('confirmation-icon--info');
  document.querySelector('#step-5 .confirmation-details')?.classList.add('hidden');
  document.querySelector('#step-5 .confirmation-trust')?.classList.add('hidden');
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
  document.getElementById('captcha-error')?.classList.add('hidden');
  resetTurnstile(); // garantit un token frais pour la nouvelle simulation

  goToStep(1);
}

/* Partage du simulateur - Web Share API (mobile : WhatsApp, réseaux, iMessage…),
   repli WhatsApp Web sur desktop. */
function shareSimulator() {
  const url = 'https://charlusminus.github.io/balinaisa-simulateur/?utm_source=partage&utm_medium=share&utm_campaign=balinaisa-ai';
  const text = "J'ai découvert Balinaisa.ai, l'œil de Dominique : le simulateur d'aménagement en teck Balinaisa, intérieur et extérieur. Une photo de votre espace suffit :";
  if (navigator.share) {
    navigator.share({ title: 'Balinaisa.ai · Balinaisa', text: text, url: url }).catch(() => {});
  } else {
    window.open('https://wa.me/?text=' + encodeURIComponent(text + ' ' + url), '_blank', 'noopener');
  }
}

/* CTA "Simuler avec Balinaisa.ai" dans le header : apparaît dès que le CTA du hero
   sort de l'écran (et disparaît quand il revient). Toujours à portée de main. */
/* Video de fond du hero : le MP4 est lourd (~50 Mo). Par defaut on affiche le
   poster (leger), et on ne charge/joue la video QUE si ca vaut le coup :
   desktop, connexion correcte, sans Save-Data ni preference de mouvement reduit.
   Chargement apres l'evenement load pour ne pas concurrencer le rendu initial. */
function maybeLoadHeroVideo() {
  const video = document.querySelector('.hero-bg-video');
  if (!video) return;
  const mm = window.matchMedia;
  const reduced = mm && mm('(prefers-reduced-motion: reduce)').matches;
  const small = mm && mm('(max-width: 760px)').matches;
  const conn = navigator.connection || {};
  const constrained = conn.saveData === true || /(^|-)2g$/.test(conn.effectiveType || '');
  if (reduced || small || constrained) return; // on garde le poster
  const source = video.querySelector('source[data-src]');
  if (!source || source.src) return;
  source.src = source.getAttribute('data-src');
  try { video.load(); const p = video.play(); if (p) p.catch(() => {}); } catch (e) {}
}
window.addEventListener('load', maybeLoadHeroVideo);

document.addEventListener('DOMContentLoaded', () => {
  const heroCta = document.querySelector('.hero-cta-pulse');
  const headerCta = document.getElementById('header-cta');
  const hero = document.getElementById('hero');
  if (!heroCta || !headerCta || !('IntersectionObserver' in window)) return;
  const io = new IntersectionObserver((entries) => {
    const homeVisible = !hero.classList.contains('hidden');
    headerCta.classList.toggle('is-visible', homeVisible && !entries[0].isIntersecting);
  }, { rootMargin: '-64px 0px 0px 0px', threshold: 0 });
  io.observe(heroCta);
});
