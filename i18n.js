/* Balinaisa.ai, i18n FR/EN.
   UNE PAGE = UNE LANGUE = UN CANONICAL. La langue vient du CHEMIN, jamais du navigateur :
     /     -> FR, toujours, pour tout le monde, Googlebot compris.
     /en/  -> EN, page generee au build par tools/build-en.js depuis le dictionnaire.
   Avant, `/` se traduisait toute seule pour un navigateur non francophone. Or Googlebot
   execute le JS ET se presente en en-US : il pouvait donc indexer `/` comme une page
   anglaise, en concurrence avec /en/ sur les memes requetes. D'ou la bascule sur le chemin.
   Un bandeau discret (pas une redirection : Googlebot crawle depuis les US et ne verrait
   jamais le FR) propose /en/ aux navigateurs non francophones.
   Les traductions vivent dans i18n-en.js, charge par les seules pages de /en/ : ce fichier
   n'est plus que le RUNTIME (switch de langue, bandeau, tr(), filet de rattrapage).
   window.i18n.lang / window.i18n.t(fr) exposes pour les chaines generees en JS (simulator.js). */
(function () {
  // Le chemin fait foi. Rien d'autre.
  function detect() {
    return /^\/en(\/|$)/.test(location.pathname) ? 'en' : 'fr';
  }

  var LANG = detect();

  // Compat : ?lang=en etait l'ancien override. Des liens externes peuvent encore le porter.
  // On le renvoie sur la vraie page anglaise plutot que de le laisser mourir en silence.
  (function legacyLangParam() {
    try {
      var q = new URLSearchParams(location.search).get('lang');
      if (q !== 'fr' && q !== 'en') return;
      var target = (q === 'en') ? '/en/' : '/';
      if (location.pathname === target) return;
      location.replace(target);
    } catch (e) {}
  })();

  // Dictionnaire FR -> EN : il vit dans i18n-en.js, que SEULES les pages de /en/ chargent.
  // Il ne sert nulle part ailleurs (tr() sort tout de suite en francais, la boucle de applyDOM
  // aussi), et il pesait 47 Ko sur chaque page. Absent, on retombe sur un dico vide : la page
  // reste fonctionnelle, elle n'a simplement rien a traduire, ce qui est le cas du francais.
  var DICT = window.__I18N_EN || { EN: {}, meta: {} };
  var EN = DICT.EN;

  function tr(s) {
    if (LANG !== 'en' || s == null) return s;
    var key = String(s).replace(/\s+/g, ' ').trim();
    return Object.prototype.hasOwnProperty.call(EN, key) ? EN[key] : s;
  }


  // Le switch est fait de vrais LIENS, pas de boutons JS. Deux raisons : la langue EST le
  // chemin, donc changer de langue = changer de page ; et un <a href> entre les deux versions
  // est crawlable, ce qui est precisement ce qu'un couple hreflang attend.
  // La cible du switch et du bandeau vient des <link rel=alternate hreflang> de la page :
  // c'est la source de verite du couple FR/EN (build-en.js les ecrit), et une page sans
  // couple (merci.html, /marque/) n'a pas de switch, plutot qu'un switch qui renvoie a
  // l'accueil. Avant le 03/09 les cibles etaient / et /en/ en dur : depuis /presse/, le
  // switch aurait ramene a l'accueil, et de toute facon la page ne chargeait pas ce script.
  function alternate(lang) {
    var el = document.querySelector('link[rel="alternate"][hreflang="' + lang + '"]');
    if (!el) return null;
    var href = el.getAttribute('href');
    try { return new URL(href, location.href).pathname; } catch (e) { return href; }
  }

  function buildSwitch() {
    var header = document.querySelector('.header');
    if (!header || document.getElementById('lang-switch')) return;
    var fr = alternate('fr'), en = alternate('en');
    if (!fr || !en) return;
    var wrap = document.createElement('div');
    wrap.id = 'lang-switch';
    wrap.setAttribute('role', 'group');
    wrap.setAttribute('aria-label', 'Language / Langue');
    wrap.style.cssText = 'display:inline-flex;gap:2px;align-items:center;margin-left:auto;margin-right:12px;font-family:Helvetica,Arial,sans-serif;font-size:12px;font-weight:600;letter-spacing:.04em';
    [['fr', fr], ['en', en]].forEach(function (pair) {
      var l = pair[0], on = (LANG === l);
      var a = document.createElement('a');
      a.textContent = l.toUpperCase();
      a.href = pair[1];
      a.setAttribute('hreflang', l);
      if (on) a.setAttribute('aria-current', 'true');
      // Langue active sur un aplat sauge fonce, l ivoire y donne 9.28 (le blanc sur dore faisait
      // 3.0 a 12 px, axe du 03/09 ; l aplat encre est passe au sauge le 11/09, comme les autres
      // elements de navigation, pour que la maison n ait qu une couleur d etat actif).
      a.style.cssText = 'text-decoration:none;cursor:pointer;background:' + (on ? '#444535' : 'transparent') + ';color:' + (on ? '#FAF9F5' : '#6F685B') + ';padding:5px 10px;border-radius:0;letter-spacing:.06em;line-height:1;transition:background .15s';
      wrap.appendChild(a);
    });
    var cta = header.querySelector('#header-cta, .header-cta');
    if (cta) header.insertBefore(wrap, cta); else header.appendChild(wrap);
  }

  // Un bandeau, PAS une redirection. Rediriger selon navigator.language est le piege SEO
  // classique : Googlebot crawle depuis les US, se fait rediriger, et n'indexe jamais le FR.
  // On propose, on n'impose pas.
  function offerEnglish() {
    if (LANG !== 'fr') return;
    var en = alternate('en');
    if (!en) return;
    var nav = ((navigator.languages && navigator.languages[0]) || navigator.language || 'fr').toLowerCase();
    if (nav.indexOf('fr') === 0) return;
    try { if (localStorage.getItem('bal_en_offer') === 'off') return; } catch (e) {}
    var bar = document.createElement('div');
    bar.id = 'en-offer';
    // Aplat sauge fonce comme le reste de la navigation : blanc a 9.77, sable a 5.62.
    bar.style.cssText = 'position:fixed;left:0;right:0;bottom:0;z-index:1000;background:#444535;color:#fff;padding:11px 16px;display:flex;align-items:center;justify-content:center;gap:14px;font-family:Helvetica,Arial,sans-serif;font-size:14px';
    var a = document.createElement('a');
    a.href = en; a.textContent = 'Read this page in English \u2192';
    a.style.cssText = 'color:#D9C19E;text-decoration:none;font-weight:600';
    var x = document.createElement('button');
    x.type = 'button'; x.textContent = '\u2715'; x.setAttribute('aria-label', 'Dismiss');
    x.style.cssText = 'background:none;border:none;color:rgba(255,255,255,.55);cursor:pointer;font-size:15px;line-height:1;padding:2px 4px';
    x.addEventListener('click', function () {
      try { localStorage.setItem('bal_en_offer', 'off'); } catch (e) {}
      bar.remove();
    });
    bar.appendChild(a); bar.appendChild(x);
    document.body.appendChild(bar);
  }

  function applyDOM() {
    document.documentElement.setAttribute('lang', LANG);
    buildSwitch();
    offerEnglish();
    // Sur /en/ le texte est deja anglais (cuit au build) : la boucle ci-dessous ne trouve rien.
    // On la garde comme FILET : si build-en.js rate un noeud, le runtime le rattrape au lieu
    // de servir du francais a un anglophone.
    if (LANG !== 'en') return;
    // textes
    var walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null);
    var nodes = [], n;
    while ((n = walker.nextNode())) nodes.push(n);
    nodes.forEach(function (node) {
      var raw = node.nodeValue;
      if (!raw || !raw.trim()) return;
      var key = raw.replace(/\s+/g, ' ').trim();
      if (Object.prototype.hasOwnProperty.call(EN, key)) {
        node.nodeValue = raw.replace(key, EN[key]); // preserve espaces autour
        if (node.nodeValue.indexOf(key) !== -1) node.nodeValue = EN[key];
      }
    });
    // attributs
    ['placeholder', 'aria-label', 'alt', 'title', 'value'].forEach(function (attr) {
      document.querySelectorAll('[' + attr + ']').forEach(function (el) {
        var v = el.getAttribute(attr);
        var key = (v || '').replace(/\s+/g, ' ').trim();
        if (Object.prototype.hasOwnProperty.call(EN, key)) el.setAttribute(attr, EN[key]);
      });
    });
    // <title> + meta (SEO cote client; les balises statiques hreflang/canonical restent en place)
    if (document.title && EN[document.title.replace(/\s+/g, ' ').trim()]) document.title = EN[document.title.replace(/\s+/g, ' ').trim()];
    // meta description + og/twitter (SEO cote client)
    var metaEN = DICT.meta;
    Object.keys(metaEN).forEach(function (k) {
      var el = document.querySelector('meta[name="' + k + '"]') || document.querySelector('meta[property="' + k + '"]');
      if (el) el.setAttribute('content', metaEN[k]);
    });
    document.querySelector('html').setAttribute('lang', 'en');
  }

  window.i18n = { lang: LANG, t: tr };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', applyDOM);
  else applyDOM();
})();
