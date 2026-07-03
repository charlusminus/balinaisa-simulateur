/* =============================================
   BALINAISA — Embed widget
   À coller avant </body> sur balinaisa.com

   Usage :
     <script src="https://charlusminus.github.io/balinaisa-simulateur/embed.js" defer></script>

   Options (data-attributes sur le script tag) :
     data-position="bottom-right"  (défaut) | "bottom-left" | "inline"
     data-label="Simuler avec Domia"
   ============================================= */
(function () {
  const script = document.currentScript || document.querySelector('script[src*="balinaisa-simulateur/embed.js"]');
  const position  = (script && script.dataset.position)  || 'bottom-right';
  const label     = (script && script.dataset.label)     || 'Simuler avec Domia ✦';
  const targetUrl = 'https://charlusminus.github.io/balinaisa-simulateur/';

  const STYLES = `
    #balinaisa-sim-btn {
      position: fixed;
      z-index: 9999;
      bottom: 28px;
      ${position === 'bottom-left' ? 'left: 28px;' : 'right: 28px;'}
      display: flex;
      align-items: center;
      gap: 8px;
      background: #8B6B45;
      color: #fff;
      font-family: 'Inter', system-ui, sans-serif;
      font-size: 14px;
      font-weight: 500;
      padding: 13px 20px;
      border-radius: 50px;
      border: none;
      cursor: pointer;
      box-shadow: 0 4px 20px rgba(139,107,69,.35);
      transition: background .18s ease, transform .18s ease, box-shadow .18s ease;
      text-decoration: none;
      letter-spacing: -0.01em;
    }
    #balinaisa-sim-btn:hover {
      background: #6B4F30;
      transform: translateY(-2px);
      box-shadow: 0 6px 28px rgba(139,107,69,.45);
    }
    #balinaisa-sim-btn svg {
      flex-shrink: 0;
    }
    @media (max-width: 480px) {
      #balinaisa-sim-btn {
        bottom: 16px;
        right: 16px;
        left: ${position === 'bottom-left' ? '16px' : 'auto'};
        font-size: 13px;
        padding: 11px 16px;
      }
    }
  `;

  const styleEl = document.createElement('style');
  styleEl.textContent = STYLES;
  document.head.appendChild(styleEl);

  const btn = document.createElement('a');
  btn.id = 'balinaisa-sim-btn';
  btn.href = targetUrl;
  btn.target = '_blank';
  btn.rel = 'noopener';
  btn.setAttribute('aria-label', 'Ouvrir le simulateur d\'extérieur Balinaisa');
  btn.innerHTML = `
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
    </svg>
    ${label}
  `;

  document.body.appendChild(btn);
})();
