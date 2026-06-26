/* =============================================
   BALINAISA SIMULATOR — Logic
   ============================================= */

const CATALOG = [
  { id: 'joko',    name: 'Joko',    cat: 'chaise',     price: 279,  color: '#C4975A', desc: 'Chaise en teck massif' },
  { id: 'aruna',   name: 'Aruna',   cat: 'chaise',     price: 359,  color: '#B8895A', desc: 'Chaise en teck massif' },
  { id: 'dune',    name: 'Dune',    cat: 'chaise',     price: 309,  color: '#D4A96A', desc: 'Chaise en teck massif' },
  { id: 'nara',    name: 'Nara',    cat: 'chaise',     price: 319,  color: '#C09050', desc: 'Chaise en teck massif' },
  { id: 'lisa',    name: 'Lisa',    cat: 'chaise',     price: 339,  color: '#B87848', desc: 'Chaise en teck massif' },
  { id: 'sari',    name: 'Sari',    cat: 'chaise',     price: 299,  color: '#D0A870', desc: 'Chaise en teck massif' },
  { id: 'luma',    name: 'Luma',    cat: 'fauteuil',   price: 499,  color: '#9A7050', desc: 'Fauteuil en teck massif' },
  { id: 'ananda',  name: 'Ananda',  cat: 'fauteuil',   price: 339,  color: '#A87850', desc: 'Fauteuil en teck massif' },
  { id: 'andini',  name: 'Andini',  cat: 'chaise',     price: 219,  color: '#C8A878', desc: 'Chaise en teck massif' },
  { id: 'padma',   name: 'Padma',   cat: 'chaise',     price: 299,  color: '#BC9060', desc: 'Chaise en teck massif' },
  { id: 'kinanti', name: 'Kinanti', cat: 'chaise',     price: 319,  color: '#D4A060', desc: 'Chaise en teck massif' },
  { id: 'indra',   name: 'Indra',   cat: 'table',      price: 389,  color: '#8B6030', desc: 'Table en teck massif' },
];

const LABEL = { chaise: 'Chaise', fauteuil: 'Fauteuil', table: 'Table', 'bain-soleil': 'Bain de soleil' };

const WEBHOOK_URL = 'https://cloud.activepieces.com/api/v1/webhooks/vBqWuW1eudqSQG4eFkacG';

// State
let currentStep = 0;
let uploadedFile = null;
let uploadedDataURL = null;
let selectedProduct = null;
let qty = 1;

/* =============================================
   HERO ↔ SIMULATOR
   ============================================= */
function startSimulator() {
  document.getElementById('hero').classList.add('hidden');
  document.getElementById('simulator').classList.remove('hidden');
  document.getElementById('cta-widget').classList.add('hidden');
  window.scrollTo({ top: 0, behavior: 'smooth' });
  renderCatalog('all');
}

function backToHome() {
  document.getElementById('simulator').classList.add('hidden');
  document.getElementById('hero').classList.remove('hidden');
  document.getElementById('cta-widget').classList.remove('hidden');
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
   CATALOG
   ============================================= */
function renderCatalog(filter) {
  const grid = document.getElementById('catalog-grid');
  const items = filter === 'all' ? CATALOG : CATALOG.filter(p => p.cat === filter);
  grid.innerHTML = items.map(p => `
    <div class="catalog-card${selectedProduct?.id === p.id ? ' selected' : ''}"
         onclick="selectProduct('${p.id}')"
         data-cat="${p.cat}">
      <div class="catalog-card-img" style="background: linear-gradient(135deg, ${p.color}22, ${p.color}44);">
        <svg width="56" height="42" viewBox="0 0 56 42" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="4" y="18" width="48" height="14" rx="3" fill="${p.color}" opacity="0.8"/>
          <rect x="8" y="10" width="40" height="10" rx="2" fill="${p.color}"/>
          <rect x="8" y="32" width="6" height="8" rx="1" fill="${p.color}" opacity="0.7"/>
          <rect x="42" y="32" width="6" height="8" rx="1" fill="${p.color}" opacity="0.7"/>
        </svg>
      </div>
      <div class="catalog-card-body">
        <div class="catalog-card-name">${p.name}</div>
        <div class="catalog-card-mat">Teck massif</div>
        <div class="catalog-card-price">${p.price.toLocaleString('fr-FR')},00 €</div>
      </div>
    </div>
  `).join('');
}

function filterCatalog(cat, btn) {
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  renderCatalog(cat);
}

function selectProduct(id) {
  selectedProduct = CATALOG.find(p => p.id === id);
  qty = 1;
  document.querySelectorAll('.catalog-card').forEach(c => c.classList.remove('selected'));
  document.querySelector(`[onclick="selectProduct('${id}')"]`)?.classList.add('selected');
  document.getElementById('btn-step2-next').disabled = false;
  document.getElementById('qty-val').textContent = qty;
  document.getElementById('catalog-qty-row').classList.remove('hidden');
  applyStickies();
}

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
  setSticky(2, !!selectedProduct);
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

  if (step === 3) populateLeadForm();

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
  const pct = { 1: 25, 2: 50, 3: 75, 4: 100 }[step] || 25;
  document.getElementById('progress-bar').style.width = pct + '%';
}

/* =============================================
   QTY
   ============================================= */
function changeQty(delta) {
  qty = Math.max(1, Math.min(20, qty + delta));
  document.getElementById('qty-val').textContent = qty;
}

function fmt(n) {
  return n.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €';
}

/* =============================================
   STEP 3 — LEAD FORM
   ============================================= */
function populateLeadForm() {
  const p = selectedProduct;
  if (!p) return;
  const recap = document.getElementById('lead-product-recap');
  recap.innerHTML = `
    <div class="lead-recap-card">
      <div class="lead-recap-img" style="background: linear-gradient(135deg, ${p.color}22, ${p.color}44);">
        <svg width="40" height="30" viewBox="0 0 56 42" fill="none">
          <rect x="4" y="18" width="48" height="14" rx="3" fill="${p.color}" opacity="0.8"/>
          <rect x="8" y="10" width="40" height="10" rx="2" fill="${p.color}"/>
          <rect x="8" y="32" width="6" height="8" rx="1" fill="${p.color}" opacity="0.7"/>
          <rect x="42" y="32" width="6" height="8" rx="1" fill="${p.color}" opacity="0.7"/>
        </svg>
      </div>
      <div class="lead-recap-info">
        <p class="lead-recap-name">${p.name}</p>
        <p class="lead-recap-mat">Teck massif · ${LABEL[p.cat] || p.cat}</p>
        <p class="lead-recap-price">${fmt(p.price)} / unité · <strong>Qté : ${qty}</strong></p>
      </div>
      <div class="lead-recap-photo">
        <img src="${uploadedDataURL}" alt="Votre espace">
        <span>Votre espace</span>
      </div>
    </div>
  `;
}

async function submitLead(e) {
  e.preventDefault();
  const btn = document.getElementById('btn-submit-lead');
  btn.disabled = true;
  btn.innerHTML = '<span>Envoi en cours…</span>';

  const firstName = document.getElementById('f-firstname').value.trim();
  const lastName  = document.getElementById('f-lastname').value.trim();

  // photo_base64 excluded: full-res base64 (3-10 MB) would overflow the AP webhook body
  // limit and silently wipe all fields. Image handling goes through a separate upload step.
  const payload = {
    first_name:       firstName,
    last_name:        lastName,
    name:             `${firstName} ${lastName}`,
    email:            document.getElementById('f-email').value.trim(),
    phone:            document.getElementById('f-phone').value.trim(),
    intent:           document.getElementById('f-intent').value,
    product:          selectedProduct?.name,
    product_id:       selectedProduct?.id,
    product_cat:      selectedProduct?.cat,
    product_price_ht: selectedProduct?.price,
    qty,
    price_ttc:        selectedProduct ? (selectedProduct.price * qty * 1.2).toFixed(2) : null,
    source:           'simulateur-balinaisa',
  };

  try {
    await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  } catch (_) {}

  goToStep(4);
}

/* =============================================
   RESET
   ============================================= */
function resetSimulator() {
  selectedProduct = null;
  uploadedFile = null;
  uploadedDataURL = null;
  qty = 1;

  document.getElementById('preview-img').classList.add('hidden');
  document.getElementById('preview-img').src = '';
  document.getElementById('upload-zone-inner').classList.remove('hidden');
  document.getElementById('upload-zone').classList.remove('has-file');
  document.getElementById('btn-step1-next').disabled = true;
  document.getElementById('btn-step2-next').disabled = true;
  document.getElementById('catalog-qty-row').classList.add('hidden');

  const form = document.getElementById('lead-form');
  if (form) form.reset();
  const btn = document.getElementById('btn-submit-lead');
  if (btn) {
    btn.disabled = false;
    btn.innerHTML = `Lancer ma simulation gratuite
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>`;
  }

  renderCatalog('all');
  goToStep(1);
}
