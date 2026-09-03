/* ============================================================
   BALINAISA, widget « Imaginez chez vous »
   Bouton flottant (sticky CTA) à déposer sur balinaisa.com.

   Défauts arrêtés le 27/08 : libellé « Imaginez chez vous », cible https://balinaisa.ai/
   et arrivée DIRECTE sur l'étape 1 (import de la photo) via ?start=1, jamais sur
   l'écran d'accueil : le site porte déjà l'accroche, la redoubler fait perdre le clic.

   Le libellé dit le BÉNÉFICE, pas la fonction : « Imaginez chez vous » plutôt que
   « Simulateur ». « Imaginer » est le verbe retenu au point d'étape du 17/07 pour son
   côté projectif, préféré à « composer ». Il respecte aussi la règle de marque
   « zéro mention IA » d'AGENTS.md, ce que le libellé précédent ne faisait pas.
   Il est modifiable À DISTANCE sans toucher au site hôte : c'est tout l'intérêt de
   faire coller la balise NUE, sans data-label. Ne pas figer ce texte côté client.
   Autonome : aucune dépendance au CSS du site hôte, styles scopés.

   Intégration (avant </body>) :
     <script src="https://balinaisa.ai/embed.js" defer></script>

   Options (data-attributes sur la balise <script>) :
     data-position="bottom-right" (défaut) | "bottom-left"
     data-label="Imaginez chez vous"
     data-utm-source="site-balinaisa"     (défaut)
     data-utm-medium="widget-sticky"      (défaut)
     data-utm-campaign="balinaisa-ai"            (défaut)
     data-target="https://balinaisa.ai/"  (défaut)
     data-skip-intro="true"  (défaut) : arrive direct sur l'import photo (ajoute ?start=1),
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
  var label    = ds.label || 'Imaginez chez vous';
  var base     = ds.target || 'https://balinaisa.ai/';
  // Venant du site, on saute l'ecran d'accueil et on arrive direct sur l'import photo.
  var skipIntro = ds.skipIntro !== 'false';
  var utm = {
    source:   ds.utmSource   || 'site-balinaisa',
    medium:   ds.utmMedium   || 'widget-sticky',
    campaign: ds.utmCampaign || 'balinaisa-ai'
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
    var payload = { event: 'balinaisa_widget_click', widget: 'simulateur-balinaisa-ai',
                    utm_source: utm.source, utm_medium: utm.medium, utm_campaign: utm.campaign };
    try { if (window.dataLayer && window.dataLayer.push) window.dataLayer.push(payload); } catch (e) {}
    try { if (typeof window.gtag === 'function')
      window.gtag('event', 'widget_click', { event_category: 'simulateur_balinaisa_ia',
        event_label: 'sticky_cta', utm_campaign: utm.campaign }); } catch (e) {}
    try { if (typeof window.plausible === 'function')
      window.plausible('Widget Simulateur Balinaisa.ai'); } catch (e) {}
  }

  var side = position === 'bottom-left' ? 'left' : 'right';

  var CSS = [
    '#balinaisa-ai-widget{position:fixed;z-index:2147483000;bottom:28px;', side, ':28px;',
      'filter:drop-shadow(0 8px 28px rgba(154,106,51,.50));}',
    '#balinaisa-ai-widget::before{content:"";position:absolute;inset:-4px;border-radius: 0;',
      'border:2px solid rgba(154,106,51,.50);pointer-events:none;',
      'animation:bdw-ring 2.8s ease-in-out infinite;}',
    '#balinaisa-ai-widget a{position:relative;display:flex;align-items:center;gap:9px;',
      'background:#C3875E;color:#fff;border:none;border-radius: 0;padding:13px 20px 13px 16px;',
      'font-family:Inter,system-ui,-apple-system,Segoe UI,Roboto,sans-serif;font-size:14px;',
      'font-weight:500;line-height:1;letter-spacing:-.01em;text-decoration:none;cursor:pointer;',
      'overflow:hidden;white-space:nowrap;-webkit-tap-highlight-color:transparent;',
      'transition:transform .2s ease,background .2s ease,box-shadow .2s ease;}',
    '#balinaisa-ai-widget a:hover{background:#A96E47;transform:scale(1.04);}',
    '#balinaisa-ai-widget a:active{transform:scale(.97);}',
    '#balinaisa-ai-widget a:focus-visible{outline:3px solid rgba(154,106,51,.55);outline-offset:3px;}',
    '#balinaisa-ai-widget svg{flex-shrink:0;}',
    '#balinaisa-ai-widget .bdw-star{font-size:13px;opacity:.8;}',
    '#balinaisa-ai-widget .bdw-shimmer{position:absolute;top:0;left:-80%;width:55%;height:100%;',
      'background:linear-gradient(90deg,transparent,rgba(255,255,255,.38),transparent);',
      'transform:skewX(-15deg);pointer-events:none;animation:bdw-shimmer 2.8s ease-in-out infinite;}',
    '@keyframes bdw-ring{0%,100%{opacity:1;transform:scale(1);}50%{opacity:0;transform:scale(1.07);}}',
    '@keyframes bdw-shimmer{0%{left:-80%;}65%,100%{left:160%;}}',
    // Tablette / petit écran
    '@media(max-width:860px){#balinaisa-ai-widget{bottom:20px;', side, ':16px;}}',
    // Mobile
    '@media(max-width:480px){#balinaisa-ai-widget a{font-size:13px;padding:12px 16px 12px 14px;gap:7px;}',
      '#balinaisa-ai-widget .bdw-star{font-size:12px;}}',
    // Très petit écran
    '@media(max-width:360px){#balinaisa-ai-widget{', side, ':12px;bottom:16px;}',
      '#balinaisa-ai-widget a{font-size:12.5px;padding:11px 14px;}}',
    // Accessibilité : pas d'animation si l'utilisateur le demande
    '@media(prefers-reduced-motion:reduce){#balinaisa-ai-widget::before,',
      '#balinaisa-ai-widget .bdw-shimmer{animation:none;}',
      '#balinaisa-ai-widget::before{opacity:.6;}}'
  ].join('');

  var styleEl = document.createElement('style');
  styleEl.id = 'balinaisa-ai-widget-style';
  styleEl.textContent = CSS;

  var wrap = document.createElement('div');
  wrap.id = 'balinaisa-ai-widget';
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
