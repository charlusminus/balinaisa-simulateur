/* Balinaisa.ai — i18n FR/EN.
   Politique: francophone (navigator.language commence par "fr") => FR (defaut, aucune trad).
   Sinon => EN. Override manuel possible via ?lang=fr|en (persiste en localStorage).
   Traduction non-invasive: dictionnaire FR->EN applique au DOM (textes + attributs) au chargement.
   Les noms propres (Balinaisa, produits, avis, emails, adresse) ne sont pas dans le dico -> inchanges.
   window.i18n.lang / window.i18n.t(fr) exposes pour les chaines generees en JS (simulator.js). */
(function () {
  function detect() {
    try {
      var q = new URLSearchParams(location.search).get('lang');
      if (q === 'fr' || q === 'en') { localStorage.setItem('bal_lang', q); return q; }
      var s = localStorage.getItem('bal_lang');
      if (s === 'fr' || s === 'en') return s;
    } catch (e) {}
    var nav = ((navigator.languages && navigator.languages[0]) || navigator.language || 'fr').toLowerCase();
    return nav.indexOf('fr') === 0 ? 'fr' : 'en';
  }

  var LANG = detect();

  // Dictionnaire FR -> EN (cle = texte FR exact, tel qu'affiche).
  var EN = {
    // — SEO / meta —
    "Mobilier en teck, intérieur et extérieur : simulateur | Balinaisa": "Teak furniture, indoor and outdoor: simulator | Balinaisa",
    // — Header / hero —
    "Simuler avec Balinaisa.ai": "Try Balinaisa.ai",
    "Votre espace,": "Your space,",
    "sublimé par le teck": "elevated by teak",
    "Photographiez votre terrasse, votre jardin ou votre intérieur : Balinaisa.ai y projette les pièces en teck massif qui subliment le lieu, et vous adresse un devis. Le regard d'un artisan, à portée de tous.": "Photograph your terrace, garden or interior: Balinaisa.ai places the solid teak pieces that elevate the space and sends you a quote. A craftsman's eye, within everyone's reach.",
    "Gratuit · Sans inscription · Résultats en boite mail en quelques minutes": "Free · No sign-up · Results in your inbox within minutes",
    "Importez une photo de votre espace": "Upload a photo of your space",
    "Glissez votre photo ici": "Drop your photo here",
    "ou cliquez pour importer": "or click to upload",
    "JPG ou PNG · max 10 Mo · salon, terrasse, jardin, véranda · vue d'ensemble recommandée": "JPG or PNG · max 10 MB · living room, terrace, garden, veranda · a wide shot works best",
    "JPG, PNG, WEBP · max 8 Mo": "JPG, PNG, WEBP · max 8 MB",
    "Façonnées à la main, à partir de 219 €": "Handcrafted, from €219",
    "à partir de 219 €": "from €219",
    "à partir de 219 € la pièce": "from €219 apiece",
    "Gamme premium, façonnée à la main en teck massif ·": "Premium range, handcrafted in solid teak ·",
    "Teck massif d'Indonésie": "Solid Indonesian teak",
    // — Wizard steps —
    "Étape 1 / 4": "Step 1 / 4",
    "Étape": "Step",
    "Votre espace est prêt": "Your space is ready",
    "Balinaisa.ai sélectionne le mobilier en teck Balinaisa adapté et génère votre simulation.": "Balinaisa.ai selects the right Balinaisa teak furniture and generates your simulation.",
    "Votre espace": "Your space",
    "← Retour": "← Back",
    "Vous êtes...": "You are...",
    "Vous êtes *": "You are *",
    "Un particulier": "An individual",
    "Un professionnel": "A professional",
    "Indiquez si vous êtes un particulier ou un professionnel.": "Let us know whether you are an individual or a professional.",
    "Votre horizon d'achat, et c'est parti": "Your purchase horizon, and off we go",
    "Horizon d'achat *": "Purchase horizon *",
    "Sélectionnez…": "Select…",
    "Maintenant": "Now",
    "D'ici 1 à 3 mois": "Within 1 to 3 months",
    "Dans 3 mois et plus": "In 3 months or more",
    "Je suis juste curieux(se)": "Just curious",
    "Vos préférences": "Your preferences",
    "Budget approximatif du projet": "Approximate project budget",
    "Moins de 1 000 €": "Under €1,000",
    "Plus de 8 000 €": "Over €8,000",
    "Préfère ne pas préciser": "Prefer not to say",
    "Pour adapter votre simulation et votre devis": "To tailor your simulation and quote",
    "(optionnel)": "(optional)",
    "Vos coordonnées": "Your details",
    "Dernière étape": "Last step",
    "Prénom *": "First name *",
    "Nom *": "Last name *",
    "Nom de l'entreprise *": "Company name *",
    "Email *": "Email *",
    "Email": "Email",
    "Téléphone *": "Phone *",
    "Téléphone": "Phone",
    "Pour vous envoyer votre simulation par email": "So we can email you your simulation",
    "J'accepte que Balinaisa me contacte au sujet de ma simulation": "I agree that Balinaisa may contact me about my simulation",
    "Politique de confidentialité &amp; Protection des données": "Privacy policy &amp; Data protection",
    "Politique de confidentialité & Protection des données": "Privacy policy & Data protection",
    // — Confirmation (step 5) —
    "Votre simulation se prépare": "Your simulation is on its way",
    "Vous recevrez votre rendu personnalisé par email d'ici quelques minutes, accompagné de votre devis estimatif.": "You will receive your personalised rendering by email within a few minutes, along with your estimated quote.",
    "Votre simulation est une proposition d'ensemble, pensée pour inspirer : le budget n'est pas une limite, et votre sélection sera affinée en direct avec l'équipe Balinaisa.": "Your simulation is an overall proposal, meant to inspire: the budget is not a limit, and your selection will be refined directly with the Balinaisa team.",
    "Votre simulation reste une proposition d'ensemble, pensée pour inspirer, et sera affinée avec l'équipe Balinaisa.": "Your simulation is an overall proposal, meant to inspire, and will be refined with the Balinaisa team.",
    "Simulation dans votre boîte email": "Simulation in your inbox",
    "Votre rendu avec le mobilier en teck intégré dans votre espace, accompagné d'un devis personnalisé.": "Your rendering with the teak furniture placed in your space, along with a personalised quote.",
    "Un conseiller vous contacte": "An advisor reaches out",
    "L'équipe Balinaisa vous rappelle pour affiner votre projet et répondre à vos questions.": "The Balinaisa team calls you back to refine your project and answer your questions.",
    "Visiter le site Balinaisa": "Visit the Balinaisa site",
    "Partager Balinaisa.ai": "Share Balinaisa.ai",
    "Refaire une simulation": "Run another simulation",
    "Showroom · itinéraire": "Showroom · directions",
    // — Blocked / curious screen —
    "Merci pour votre intérêt": "Thank you for your interest",
    "Chaque simulation composée par Balinaisa.ai a un coût réel. Pour cette raison, elle est aujourd'hui réservée aux personnes ayant une intention d'achat confirmée.": "Each simulation composed by Balinaisa.ai has a real cost. For this reason, it is currently reserved for people with a confirmed purchase intent.",
    "Revenez à l'étape précédente et indiquez votre horizon d'achat réel pour lancer votre simulation gratuite.": "Go back to the previous step and enter your real purchase horizon to start your free simulation.",
    "Modifier mon horizon d'achat": "Change my purchase horizon",
    "Retour à l'accueil": "Back to home",
    // — Sections marketing —
    "Vous avez un projet en tête ?": "Have a project in mind?",
    "Quelques pièces de la collection": "A few pieces from the collection",
    "Chaise": "Chair",
    "Fauteuil": "Armchair",
    "Table basse": "Coffee table",
    "Bain de soleil": "Sun lounger",
    "La maison Balinaisa": "The Balinaisa house",
    "Le teck d'Indonésie, en circuit court": "Indonesian teak, direct from the source",
    "Chaque pièce est façonnée à la main par nos artisans partenaires en Indonésie, dans un teck massif choisi avec soin. Une relation directe, sans intermédiaire, pour une qualité rare et des finitions durables, pensées pour l'extérieur comme pour l'intérieur.": "Each piece is handcrafted by our partner artisans in Indonesia, from carefully selected solid teak. A direct relationship, with no middlemen, for rare quality and durable finishes, designed for outdoors as well as indoors.",
    "Artisans partenaires, circuit court": "Partner artisans, short supply chain",
    "Showroom au bassin d'Arcachon": "Showroom in the Arcachon basin",
    "Balinaisa.ai, entraîné comme l'œil de Dominique Raynal : son savoir-faire du teck, rendu accessible. Photographiez votre espace : il compose votre aménagement et vous adresse un devis en quelques secondes.": "Balinaisa.ai, trained as Dominique Raynal's eye: his teak expertise, made accessible. Photograph your space: it composes your layout and sends you a quote in seconds.",
    "« J'ai façonné Balinaisa.ai comme une extension de mon savoir-faire : des années de teck, un regard sur les proportions, le goût des matières justes. Aujourd'hui, il compose pour vous, chez vous, comme si je poussais votre portail à vos côtés. »": "“I shaped Balinaisa.ai as an extension of my craft: years of teak, an eye for proportion, a taste for the right materials. Today it composes for you, in your home, as if I were stepping through your gate beside you.”",
    "Dominique Raynal · Balinaisa": "Dominique Raynal · Balinaisa",
    "Dominique Raynal, Balinaisa": "Dominique Raynal, Balinaisa",
    "Simulation propulsée par": "Simulation powered by",
    // — Trust / reviews / press —
    "Ils nous font confiance": "They trust us",
    "Voir les avis sur Google": "See the reviews on Google",
    "8 avis Google": "8 Google reviews",
    "· 8 avis Google": "· 8 Google reviews",
    "Magnifique collection de meubles décoratifs intérieurs et extérieurs. Accueil très sympa et professionnel.": "Wonderful collection of decorative indoor and outdoor furniture. Very friendly and professional welcome.",
    "J'ai acheté une table en teck et des chaises. Une très belle qualité de fabrication à un prix plus que raisonnable.": "I bought a teak table and chairs. Beautiful build quality at a more than reasonable price.",
    "On ne peut qu'être séduit par la sélection de meubles. Très bons conseils.": "You can't help but be won over by the furniture selection. Great advice.",
    "« Une très belle qualité de fabrication à un prix plus que raisonnable. »": "“Beautiful build quality at a more than reasonable price.”",
    "Vu dans la presse": "As seen in the press",
    "« Balinaisa, la maison qui fait voyager sans quitter votre salon »": "“Balinaisa, the house that takes you travelling without leaving your living room”",
    "Lire l'article": "Read the article",
    // — FAQ —
    "Questions fréquentes": "Frequently asked questions",
    "Qu'est-ce que Balinaisa.ai ?": "What is Balinaisa.ai?",
    "Balinaisa.ai est le simulateur d'aménagement Balinaisa, pensé comme l'œil de Dominique Raynal. À partir d'une photo de votre espace, il compose une sélection de mobilier en teck massif et génère un devis estimatif.": "Balinaisa.ai is the Balinaisa layout simulator, designed as Dominique Raynal's eye. From a photo of your space, it composes a selection of solid teak furniture and generates an estimated quote.",
    "Le simulateur est-il gratuit ?": "Is the simulator free?",
    "Oui. La simulation est gratuite et sans inscription.": "Yes. The simulation is free and requires no sign-up.",
    "Comment fonctionne la simulation ?": "How does the simulation work?",
    "Photographiez votre terrasse, votre jardin ou votre intérieur, précisez éventuellement vos préférences, et recevez par email votre rendu ainsi qu'un devis estimatif en quelques minutes.": "Photograph your terrace, garden or interior, optionally add your preferences, and receive your rendering plus an estimated quote by email within minutes.",
    "Quel mobilier est proposé ?": "What furniture is offered?",
    "Du mobilier en teck massif d'Indonésie de la collection Balinaisa, pour l'intérieur comme pour l'extérieur : chaises, fauteuils et tables, façonnés à la main.": "Solid Indonesian teak furniture from the Balinaisa collection, for indoors and outdoors: chairs, armchairs and tables, handcrafted.",
    "Combien coûte le mobilier Balinaisa ?": "How much does Balinaisa furniture cost?",
    "Un positionnement haut de gamme : les pièces démarrent autour de 219 € et montent selon la taille et la collection. Chaque simulation s'accompagne d'un devis estimatif.": "A premium positioning: pieces start around €219 and rise depending on size and collection. Each simulation comes with an estimated quote.",
    // — Footer —
    "Showroom au bassin d'Arcachon ": "Showroom in the Arcachon basin ",
    // — Alt / aria —
    "Espace visible pour placer un meuble": "Visible space to place furniture",
    "Bonne luminosité naturelle": "Good natural light",
    "Salon, terrasse, jardin, véranda": "Living room, terrace, garden, veranda",
    "Voir les avis sur Google ": "See the reviews on Google ",
    // — JS messages (simulator.js) —
    "Indiquez un numéro de téléphone valide (8 à 15 chiffres, indicatif international accepté, ex. +33 6 12 34 56 78).": "Please enter a valid phone number (8 to 15 digits, international prefix accepted, e.g. +33 6 12 34 56 78).",
    "Le simulateur reçoit un grand nombre de demandes en ce moment. Merci de réessayer un peu plus tard dans la journée.": "The simulator is receiving a high volume of requests right now. Please try again a little later today.",
    "Un souci est survenu lors de la validation. Merci de réessayer, ou écrivez-nous à contact@balinaisa.com.": "Something went wrong during validation. Please try again, or write to us at contact@balinaisa.com.",
    "Merci de confirmer que vous n'êtes pas un robot.": "Please confirm you are not a robot.",
    "Votre intérêt nous honore": "We're honoured by your interest",
    "Vous avez déjà composé plusieurs ambiances avec Balinaisa.ai, et votre enthousiasme nous touche. Pour imaginer la suite sur mesure et donner vie à votre projet, l'équipe Balinaisa se fera une joie d'échanger avec vous :": "You have already composed several looks with Balinaisa.ai, and your enthusiasm touches us. To imagine the next steps, tailor-made, and bring your project to life, the Balinaisa team will be delighted to talk with you:",
    "Simulateur très sollicité": "Simulator in high demand",
    "Nous n'avons pas pu traiter votre demande": "We couldn't process your request",
    "J'ai découvert Balinaisa.ai, le simulateur d'aménagement en teck Balinaisa (intérieur et extérieur), entraîné comme l'œil de Dominique. Une photo de votre espace suffit :": "I discovered Balinaisa.ai, the Balinaisa teak layout simulator (indoor and outdoor), trained as Dominique's eye. A photo of your space is all it takes:",
    // — boutons / labels / placeholders / aria / alt manquants —
    "Balinaisa.ai, entraîné comme l'œil de Dominique": "Balinaisa.ai, trained as Dominique's eye",
    "Prendre une photo": "Take a photo",
    "Importer une photo": "Upload a photo",
    "Retirer la photo": "Remove photo",
    "Lancer ma simulation gratuite": "Start my free simulation",
    "Votre société": "Your company",
    "Ex. : « Une ambiance chaleureuse et cosy, tons sable et bois, pour un coin détente à l'ombre. » Couleurs, style, budget max, pièces souhaitées…": "E.g. “A warm, cosy feel in sand and wood tones, for a shaded relaxation nook.” Colours, style, max budget, the pieces you'd like…",
    "Note : 5 sur 5": "Rating: 5 out of 5",
    "Note Google : 5 sur 5, 8 avis": "Google rating: 5 out of 5, 8 reviews",
    "Importer une photo de votre espace": "Upload a photo of your space",
    "Aperçu de la collection et des prix": "Preview of the collection and prices",
    "Vous êtes": "You are",
    "Mobilier en teck massif Balinaisa dans le showroom": "Balinaisa solid teak furniture in the showroom",
    "Aperçu de votre pièce": "Preview of your room",
    "Indiquez un numéro de téléphone valide (indicatif international accepté).": "Enter a valid phone number (international prefix accepted).",
    // — merci.html —
    "Intérêt confirmé · Balinaisa": "Interest confirmed · Balinaisa",
    "Votre intérêt est confirmé": "Your interest is confirmed",
    "Merci. Un conseiller Balinaisa va vous recontacter pour affiner votre projet et répondre à vos questions.": "Thank you. A Balinaisa advisor will get back to you to refine your project and answer your questions.",
    "Découvrir la collection Balinaisa": "Discover the Balinaisa collection"
  };

  function tr(s) {
    if (LANG !== 'en' || s == null) return s;
    var key = String(s).replace(/\s+/g, ' ').trim();
    return Object.prototype.hasOwnProperty.call(EN, key) ? EN[key] : s;
  }

  function reveal() { document.documentElement.removeAttribute('data-i18n-pending'); }

  function setLang(l) {
    if (l !== 'fr' && l !== 'en') return;
    try { localStorage.setItem('bal_lang', l); } catch (e) {}
    var u = new URL(location.href);
    u.searchParams.delete('lang'); // le choix explicite prime -> on retire l'override d'URL
    location.replace(u.pathname + u.search + u.hash);
  }

  // Switch FR | EN injecte dans le header (present sur toutes les pages qui chargent i18n.js).
  function buildSwitch() {
    var header = document.querySelector('.header');
    if (!header || document.getElementById('lang-switch')) return;
    var wrap = document.createElement('div');
    wrap.id = 'lang-switch';
    wrap.setAttribute('role', 'group');
    wrap.setAttribute('aria-label', 'Language / Langue');
    wrap.style.cssText = 'display:inline-flex;gap:2px;align-items:center;margin-left:auto;margin-right:12px;font-family:Helvetica,Arial,sans-serif;font-size:12px;font-weight:600;letter-spacing:.04em';
    ['fr', 'en'].forEach(function (l) {
      var b = document.createElement('button');
      b.type = 'button'; b.textContent = l.toUpperCase();
      var on = (LANG === l);
      b.setAttribute('aria-pressed', on ? 'true' : 'false');
      b.style.cssText = 'cursor:pointer;border:none;background:' + (on ? '#B87D4B' : 'transparent') + ';color:' + (on ? '#fff' : '#8a7a66') + ';padding:4px 9px;border-radius:6px;line-height:1;transition:background .15s';
      b.addEventListener('click', function () { if (!on) setLang(l); });
      wrap.appendChild(b);
    });
    var cta = header.querySelector('#header-cta, .header-cta');
    if (cta) header.insertBefore(wrap, cta); else header.appendChild(wrap);
  }

  function applyDOM() {
    document.documentElement.setAttribute('lang', LANG);
    buildSwitch();
    if (LANG !== 'en') { reveal(); return; }
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
    var metaEN = {
      'description': "Upload a photo of your terrace, garden or interior: Balinaisa.ai, trained as Dominique's eye, places Balinaisa teak furniture in it and sends you a quote. Free, no sign-up.",
      'og:title': "Your space, elevated by teak · Balinaisa",
      'twitter:title': "Your space, elevated by teak · Balinaisa",
      'og:description': "One photo is enough: Balinaisa.ai places Balinaisa teak furniture in your space and sends you a quote. Free, no sign-up.",
      'twitter:description': "One photo is enough: Balinaisa.ai places Balinaisa teak furniture in your space and sends you a quote. Free, no sign-up."
    };
    Object.keys(metaEN).forEach(function (k) {
      var el = document.querySelector('meta[name="' + k + '"]') || document.querySelector('meta[property="' + k + '"]');
      if (el) el.setAttribute('content', metaEN[k]);
    });
    document.querySelector('html').setAttribute('lang', 'en');
    reveal();
  }

  window.i18n = { lang: LANG, t: tr, setLang: setLang };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', applyDOM);
  else applyDOM();
})();
