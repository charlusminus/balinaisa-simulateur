/* ============================================================
   BALINAISA — Widget « Simuler avec Domia »
   Bouton flottant (sticky CTA) à déposer sur balinaisa.com.
   Autonome : aucune dépendance au CSS du site hôte, styles scopés.

   Intégration (avant </body>) :
     <script src="https://simulateur.balinaisa.com/embed.js" defer></script>

   Options (data-attributes sur la balise <script>) :
     data-position="bottom-right" (défaut) | "bottom-left"
     data-label="Simuler avec Domia"
     data-utm-source="site-balinaisa"     (défaut)
     data-utm-medium="widget-sticky"      (défaut)
     data-utm-campaign="domia"            (défaut)
     data-target="https://simulateur.balinaisa.com/"  (défaut)
     data-skip-intro="true"  (défaut) — arrive direct sur l'import photo (ajoute ?start=1),
                              "false" pour ouvrir l'écran d'accueil du simulateur

   Tracking : UTM ajoutés à l'URL + événement de clic envoyé, si présents,
   à Google Analytics (gtag / dataLayer) et Plausible. Sans analytics, no-op.
   ============================================================ */
(function () {
  if (window.__balinaisaWidgetLoaded) return;      // anti double-injection
  window.__balinaisaWidgetLoaded = true;

  var script = document.currentScript ||
    document.querySelector('script[src*="embed.js"]');
  var ds = (script && script.dataset) || {};

  var position = ds.position === 'bottom-left' ? 'bottom-left' : 'bottom-right';
  var label    = ds.label || 'Simuler avec Domia';
  var base     = ds.target || 'https://simulateur.balinaisa.com/';
  // Venant du site, on saute l'ecran d'accueil et on arrive direct sur l'import photo.
  var skipIntro = ds.skipIntro !== 'false';
  var utm = {
    source:   ds.utmSource   || 'site-balinaisa',
    medium:   ds.utmMedium   || 'widget-sticky',
    campaign: ds.utmCampaign || 'domia'
  };

  // URL cible avec UTM (préserve les éventuels paramètres déjà présents)
  function buildUrl() {
    try {
      var u = new URL(base, location.href);
      u.searchParams.set('utm_source', utm.source);
      u.searchParams.set('utm_medium', utm.medium);
      u.searchParams.set('utm_campaign', utm.campaign);
      if (skipIntro) u.searchParams.set('start', '1');   // deep-link direct sur l'import photo
      return u.toString();
    } catch (e) {
      return base;
    }
  }

  // Envoi d'un événement aux analytics présents (tolérant, jamais bloquant)
  function track() {
    var payload = { event: 'balinaisa_widget_click', widget: 'simulateur-domia',
                    utm_source: utm.source, utm_medium: utm.medium, utm_campaign: utm.campaign };
    try { if (window.dataLayer && window.dataLayer.push) window.dataLayer.push(payload); } catch (e) {}
    try { if (typeof window.gtag === 'function')
      window.gtag('event', 'widget_click', { event_category: 'simulateur_domia',
        event_label: 'sticky_cta', utm_campaign: utm.campaign }); } catch (e) {}
    try { if (typeof window.plausible === 'function')
      window.plausible('Widget Simulateur Domia'); } catch (e) {}
  }

  var side = position === 'bottom-left' ? 'left' : 'right';

  var CSS = [
    '#balinaisa-domia-widget{position:fixed;z-index:2147483000;bottom:28px;', side, ':28px;',
      'filter:drop-shadow(0 8px 28px rgba(184,125,75,.50));}',
    '#balinaisa-domia-widget::before{content:"";position:absolute;inset:-4px;border-radius:50px;',
      'border:2px solid rgba(184,125,75,.50);pointer-events:none;',
      'animation:bdw-ring 2.8s ease-in-out infinite;}',
    '#balinaisa-domia-widget a{position:relative;display:flex;align-items:center;gap:9px;',
      'background:#B87D4B;color:#fff;border:none;border-radius:50px;padding:13px 20px 13px 16px;',
      'font-family:Inter,system-ui,-apple-system,Segoe UI,Roboto,sans-serif;font-size:14px;',
      'font-weight:500;line-height:1;letter-spacing:-.01em;text-decoration:none;cursor:pointer;',
      'overflow:hidden;white-space:nowrap;-webkit-tap-highlight-color:transparent;',
      'transition:transform .2s ease,background .2s ease,box-shadow .2s ease;}',
    '#balinaisa-domia-widget a:hover{background:#8B5C32;transform:scale(1.04);}',
    '#balinaisa-domia-widget a:active{transform:scale(.97);}',
    '#balinaisa-domia-widget a:focus-visible{outline:3px solid rgba(184,125,75,.55);outline-offset:3px;}',
    '#balinaisa-domia-widget svg{flex-shrink:0;}',
    '#balinaisa-domia-widget .bdw-star{font-size:13px;opacity:.8;}',
    '#balinaisa-domia-widget .bdw-shimmer{position:absolute;top:0;left:-80%;width:55%;height:100%;',
      'background:linear-gradient(90deg,transparent,rgba(255,255,255,.38),transparent);',
      'transform:skewX(-15deg);pointer-events:none;animation:bdw-shimmer 2.8s ease-in-out infinite;}',
    '@keyframes bdw-ring{0%,100%{opacity:1;transform:scale(1);}50%{opacity:0;transform:scale(1.07);}}',
    '@keyframes bdw-shimmer{0%{left:-80%;}65%,100%{left:160%;}}',
    // Tablette / petit écran
    '@media(max-width:860px){#balinaisa-domia-widget{bottom:20px;', side, ':16px;}}',
    // Mobile
    '@media(max-width:480px){#balinaisa-domia-widget a{font-size:13px;padding:12px 16px 12px 14px;gap:7px;}',
      '#balinaisa-domia-widget .bdw-star{font-size:12px;}}',
    // Très petit écran
    '@media(max-width:360px){#balinaisa-domia-widget{', side, ':12px;bottom:16px;}',
      '#balinaisa-domia-widget a{font-size:12.5px;padding:11px 14px;}}',
    // Accessibilité : pas d'animation si l'utilisateur le demande
    '@media(prefers-reduced-motion:reduce){#balinaisa-domia-widget::before,',
      '#balinaisa-domia-widget .bdw-shimmer{animation:none;}',
      '#balinaisa-domia-widget::before{opacity:.6;}}'
  ].join('');

  var styleEl = document.createElement('style');
  styleEl.id = 'balinaisa-domia-widget-style';
  styleEl.textContent = CSS;

  var wrap = document.createElement('div');
  wrap.id = 'balinaisa-domia-widget';
  wrap.innerHTML =
    '<a href="' + buildUrl() + '" target="_blank" rel="noopener" ' +
      'aria-label="Ouvrir le simulateur d\'aménagement Balinaisa">' +
      '<span class="bdw-shimmer" aria-hidden="true"></span>' +
      '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" ' +
        'stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
        '<path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>' +
      '</svg>' +
      '<span class="bdw-label">' + label + '</span>' +
      '<span class="bdw-star" aria-hidden="true">✦</span>' +
    '</a>';

  wrap.querySelector('a').addEventListener('click', track);

  function mount() {
    document.head.appendChild(styleEl);
    document.body.appendChild(wrap);
  }
  if (document.body) mount();
  else document.addEventListener('DOMContentLoaded', mount);
})();
