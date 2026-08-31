/* Balinaisa.ai — i18n FR/EN.
   UNE PAGE = UNE LANGUE = UN CANONICAL. La langue vient du CHEMIN, jamais du navigateur :
     /     -> FR, toujours, pour tout le monde, Googlebot compris.
     /en/  -> EN, page generee au build par tools/build-en.js depuis ce dictionnaire.
   Avant, `/` se traduisait toute seule pour un navigateur non francophone. Or Googlebot
   execute le JS ET se presente en en-US : il pouvait donc indexer `/` comme une page
   anglaise, en concurrence avec /en/ sur les memes requetes. D'ou la bascule sur le chemin.
   Un bandeau discret (pas une redirection : Googlebot crawle depuis les US et ne verrait
   jamais le FR) propose /en/ aux navigateurs non francophones.
   Ce fichier reste la SOURCE DE VERITE des traductions : tools/build-en.js le lit pour
   generer /en/, tools/check-i18n.js le controle. Ne jamais traduire ailleurs.
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

  // Dictionnaire FR -> EN (cle = texte FR exact, tel qu'affiche).
  var EN = {
    // — SEO / meta —
    "Simulateur déco et aménagement à partir d'une photo | Balinaisa": "Interior design and layout simulator from a photo | Balinaisa",
    // Donnees structurees (bloc ld+json). Ces trois textes ne sont jamais affiches : ils ne
    // vivent que dans le balisage lu par les moteurs. Ils sont ici parce que /en/ le sert aussi.
    "Spécialiste du mobilier en teck massif d'Indonésie, pour l'intérieur comme pour l'extérieur, dans le bassin d'Arcachon.": "Specialists in solid Indonesian teak furniture, indoors and out, in the Arcachon basin.",
    "Balinaisa.ai, simulateur d'aménagement Balinaisa": "Balinaisa.ai, the Balinaisa layout simulator",
    "Balinaisa.ai, entraîné comme l'œil de Dominique Raynal : photographiez votre terrasse, votre jardin ou votre intérieur, Balinaisa.ai y projette le mobilier en teck massif Balinaisa et vous adresse un devis estimatif.": "Balinaisa.ai, trained as Dominique Raynal's eye: photograph your terrace, garden or interior, and Balinaisa.ai places Balinaisa solid teak furniture in it and sends you an estimated quote.",
    // — Header / hero —
    "Commencer": "Get started",
    "Votre espace": "Your space",
    "sublimé par le teck": "elevated by teak",
    "Gratuit · Sans engagement · Résultats en boite mail en quelques minutes": "Free · No commitment · Results in your inbox within minutes",
    "Importez une photo de votre espace": "Upload a photo of your space",
    "Glissez votre photo ici": "Drop your photo here",
    "ou cliquez pour importer": "or click to upload",
    "JPG ou PNG · max 10 Mo · salon, terrasse, jardin, véranda · vue d'ensemble recommandée": "JPG or PNG · max 10 MB · living room, terrace, garden, veranda · a wide shot works best",
    "JPG, PNG, WEBP · max 8 Mo": "JPG, PNG, WEBP · max 8 MB",
    "Façonnées à la main": "Handcrafted",
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
    "Espace presse": "Press kit",
    // — Confirmation (step 5) —
    "Votre simulation se prépare": "Your simulation is on its way",
    "Vous recevrez votre rendu personnalisé par email": "You will receive your personalised rendering by email",
    "d'ici quelques minutes": "within a few minutes",
    ", accompagné de votre devis estimatif.": ", along with your estimated quote.",
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
    "TTC": "incl. VAT",
    "Bain de soleil": "Sun lounger",
    "Meuble TV": "TV unit",
    "Fauteuil de bar": "Bar chair",
    "Table à manger": "Dining table",
    "Table": "Table",
    "La maison Balinaisa": "The Balinaisa house",
    "Le teck d'Indonésie, en circuit court": "Indonesian teak, direct from the source",
    "Chaque pièce est façonnée à la main par nos artisans partenaires en Indonésie, dans un teck massif choisi avec soin. Une relation directe, sans intermédiaire, pour une qualité rare et des finitions durables, pensées pour l'extérieur comme pour l'intérieur.": "Each piece is handcrafted by our partner artisans in Indonesia, from carefully selected solid teak. A direct relationship, with no middlemen, for rare quality and durable finishes, designed for outdoors as well as indoors.",
    "Artisans partenaires, circuit court": "Partner artisans, short supply chain",
    "Showroom au bassin d'Arcachon": "Showroom in the Arcachon basin",
    "Le regard de Dominique Raynal, créateur et expert de mobilier en teck d'exception, sublimé par l'Intelligence Artificielle": "The eye of Dominique Raynal, creator and expert in exceptional teak furniture, elevated by Artificial Intelligence",
    "Photographiez votre espace (intérieur ou extérieur), Balinaisa.ai imagine un aménagement personnalisé et vous adresse un devis en quelques secondes.": "Photograph your space (indoors or outdoors), Balinaisa.ai imagines a bespoke layout and sends you a quote in seconds.",
    "« J'ai façonné Balinaisa.ai comme une extension de mon savoir-faire : un regard sur les proportions, le goût des matières justes. Aujourd'hui, il compose pour vous, chez vous, comme si je poussais votre porte à vos côtés. »": "“I shaped Balinaisa.ai as an extension of my craft: an eye for proportion, a taste for the right materials. Today it composes for you, in your home, as if I were stepping through your door beside you.”",
    "Dominique Raynal, Balinaisa": "Dominique Raynal, Balinaisa",
    "Intérieur ou extérieur, photographiez votre salon, votre véranda, votre terrasse ou votre jardin : Balinaisa.ai y projette les pièces en teck massif qui subliment le lieu, et vous adresse un devis. Le regard d'un artisan, à portée de tous.": "Indoors or outdoors, photograph your living room, veranda, terrace or garden: Balinaisa.ai places the solid teak pieces that elevate the space and sends you a quote. A craftsman's eye, within everyone's reach.",
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
    "Oui. La simulation est gratuite et sans engagement.": "Yes. The simulation is free with no commitment.",
    "Comment fonctionne la simulation ?": "How does the simulation work?",
    "Intérieur ou extérieur, photographiez votre espace, précisez éventuellement vos préférences, et recevez par email votre rendu ainsi qu'un devis estimatif en quelques minutes.": "Indoors or outdoors, photograph your space, optionally add your preferences, and receive your rendering plus an estimated quote by email within minutes.",
    "Quel mobilier est proposé ?": "What furniture is offered?",
    "Du mobilier en teck massif d'Indonésie de la collection Balinaisa, pour l'intérieur comme pour l'extérieur : chaises, fauteuils et tables, façonnés à la main.": "Solid Indonesian teak furniture from the Balinaisa collection, for indoors and outdoors: chairs, armchairs and tables, handcrafted.",
    "Combien coûte le mobilier Balinaisa ?": "How much does Balinaisa furniture cost?",
    "Un positionnement haut de gamme, du mobilier façonné à la main en teck massif. Les prix varient selon la pièce, la taille et la collection. Chaque simulation s'accompagne d'un devis estimatif.": "A premium positioning, furniture handcrafted in solid teak. Prices vary by piece, size and collection. Each simulation comes with an estimated quote.",
    // — Alt / aria —
    "Espace visible pour placer un meuble": "Visible space to place furniture",
    "Bonne luminosité naturelle": "Good natural light",
    "Salon, terrasse, jardin, véranda": "Living room, terrace, garden, veranda",
    // — JS messages (simulator.js) —
    "Indiquez un numéro de téléphone valide (8 à 15 chiffres, indicatif international accepté, ex. +33 6 12 34 56 78).": "Please enter a valid phone number (8 to 15 digits, international prefix accepted, e.g. +33 6 12 34 56 78).",
    "Le simulateur reçoit un grand nombre de demandes en ce moment. Merci de réessayer un peu plus tard dans la journée.": "The simulator is receiving a high volume of requests right now. Please try again a little later today.",
    "Un souci est survenu lors de la validation. Merci de réessayer, ou écrivez-nous à contact@balinaisa.com.": "Something went wrong during validation. Please try again, or write to us at contact@balinaisa.com.",
    "Merci de confirmer que vous n'êtes pas un robot.": "Please confirm you are not a robot.",
    "Votre intérêt nous honore": "We're honoured by your interest",
    "Vous avez déjà composé plusieurs ambiances avec Balinaisa.ai, et votre enthousiasme nous touche. Pour imaginer la suite sur mesure et donner vie à votre projet, l'équipe Balinaisa se fera une joie d'échanger avec vous :": "You have already composed several looks with Balinaisa.ai, and your enthusiasm touches us. To imagine the next steps, tailor-made, and bring your project to life, the Balinaisa team will be delighted to talk with you:",
    "Simulateur très sollicité": "Simulator in high demand",
    "Nous n'avons pas pu traiter votre demande": "We couldn't process your request",
    // — message de partage (bloc par bloc : l'API Web Share ne prend que du texte brut) —
    "Salut,": "Hi,",
    "J'ai découvert Balinaisa.ai, le simulateur d'aménagement (intérieur et extérieur), proposé par Dominique, le fondateur de la société Balinaisa.": "I discovered Balinaisa.ai, the interior and outdoor design simulator, offered by Dominique, the founder of Balinaisa.",
    "Une photo de ton espace suffit.": "A photo of your space is all it takes.",
    "Essaye, c'est surprenant.": "Try it, you'll be surprised.",
    "Hâte d'avoir ton retour,": "Looking forward to hearing what you think,",
    "À très vite,": "Talk soon,",
    // — boutons / labels / placeholders / aria / alt manquants —
    "Prendre une photo": "Take a photo",
    "Importer une photo": "Upload a photo",
    "Retirer la photo": "Remove photo",
    "Lancer ma simulation gratuite": "Start my free simulation",
    "Votre société": "Your company",
    "Ex. : « Une ambiance chaleureuse et cosy, tons sable et bois, pour un coin détente à l'ombre. » Couleurs, style, budget max, pièces souhaitées…": "E.g. “A warm, cosy feel in sand and wood tones, for a shaded relaxation nook.” Colours, style, max budget, the pieces you'd like…",
    "Note : 5 sur 5": "Rating: 5 out of 5",
    "Note Google : 5 sur 5, 8 avis": "Google rating: 5 out of 5, 8 reviews",
    "Importer une photo de votre espace": "Upload a photo of your space",
    "Vous êtes": "You are",
    "Mobilier en teck massif Balinaisa dans le showroom": "Balinaisa solid teak furniture in the showroom",
    "Aperçu de votre pièce": "Preview of your room",
    "Indiquez un numéro de téléphone valide (indicatif international accepté).": "Enter a valid phone number (international prefix accepted).",
    // — merci.html —
    "Intérêt confirmé · Balinaisa": "Interest confirmed · Balinaisa",
    "Votre intérêt est confirmé": "Your interest is confirmed",
    "Merci. Un conseiller Balinaisa va vous recontacter pour affiner votre projet et répondre à vos questions.": "Thank you. A Balinaisa advisor will get back to you to refine your project and answer your questions.",
    "Découvrir la collection Balinaisa": "Discover the Balinaisa collection",
    // — privacy-policy.html —
    // Texte legal : les fragments sont decoupes par le balisage inline (<strong>, <a>), donc
    // une phrase peut valoir plusieurs cles. L'ordre des propositions est le meme en FR et en
    // EN sur toute la page, sinon ce decoupage produirait des phrases anglaises inversees.
    "Politique de confidentialité & Protection des données | Balinaisa": "Privacy policy & Data protection | Balinaisa",
    "← Retour au simulateur": "← Back to the simulator",
    "Dernière mise à jour : juillet 2026": "Last updated: July 2026",
    "1. Responsable du traitement": "1. Data controller",
    "Le simulateur d'aménagement intérieur et extérieur Balinaisa.ai est édité par": "The Balinaisa.ai indoor and outdoor layout simulator is published by",
    ", en partenariat avec": ", in partnership with",
    "pour sa réalisation technique. Pour toute question relative à vos données personnelles, vous pouvez nous contacter à l'adresse": "for its technical implementation. For any question regarding your personal data, you can contact us at",
    "2. Données collectées": "2. Data collected",
    "Dans le cadre de l'utilisation du simulateur, nous collectons :": "When you use the simulator, we collect:",
    "Les informations que vous nous fournissez volontairement (prénom, nom, email, téléphone, nom d'entreprise le cas échéant, horizon d'achat, préférences de style) ;": "The information you provide voluntarily (first name, last name, email, phone, company name where applicable, purchase horizon, style preferences);",
    "La photo de votre espace que vous importez, utilisée pour générer votre simulation ;": "The photo of your space that you upload, used to generate your simulation;",
    "Des données techniques (adresse IP, type d'appareil, navigateur) et de mesure d'audience (source de la visite, paramètres de campagne), à des fins de bon fonctionnement, de sécurité et de statistiques.": "Technical data (IP address, device type, browser) and audience measurement data (visit source, campaign parameters), for the purposes of proper operation, security and statistics.",
    "3. Finalités du traitement": "3. Purposes of processing",
    "Vos données sont utilisées pour :": "Your data is used to:",
    "Générer votre simulation d'aménagement et votre devis estimatif ;": "Generate your layout simulation and your estimated quote;",
    "Vous recontacter au sujet de votre projet, si vous y avez consenti ;": "Contact you about your project, if you have consented to it;",
    "Améliorer la qualité et la fiabilité du service.": "Improve the quality and reliability of the service.",
    "4. Base légale": "4. Legal basis",
    "Le traitement de vos données repose sur votre consentement explicite, recueilli au moment de la soumission du formulaire, ainsi que sur l'intérêt légitime de Balinaisa à répondre à votre demande de simulation.": "The processing of your data is based on your explicit consent, collected when you submit the form, as well as on Balinaisa's legitimate interest in responding to your simulation request.",
    "5. Destinataires des données": "5. Data recipients",
    "Vos données sont destinées à Balinaisa et à ses prestataires techniques strictement nécessaires au fonctionnement du simulateur : hébergement et automatisation des traitements, génération automatisée du visuel, et protection contre les robots. Certains de ces prestataires peuvent être situés hors de l'Union européenne ; dans ce cas, des garanties appropriées encadrent le transfert. Vos données ne sont ni vendues ni cédées à des tiers à des fins commerciales.": "Your data is intended for Balinaisa and for the technical providers strictly necessary to operate the simulator: hosting and processing automation, automated visual generation, and bot protection. Some of these providers may be located outside the European Union; in that case, appropriate safeguards govern the transfer. Your data is neither sold nor transferred to third parties for commercial purposes.",
    "6. Traceurs et stockage local": "6. Trackers and local storage",
    "Le simulateur": "The simulator",
    "n'utilise aucun cookie publicitaire ni traceur de suivi intersites": "does not use any advertising cookie or cross-site tracker",
    "(pas de Google Analytics, pas de pixel publicitaire). Les éléments ci-dessous relèvent du fonctionnement strictement nécessaire du service, de sa sécurité, ou d'une mesure d'audience exemptée de consentement ; nous n'affichons donc pas de bannière :": "(no Google Analytics, no advertising pixel). The items below are strictly necessary for the operation of the service, for its security, or fall under audience measurement exempt from consent; we therefore display no banner:",
    "Préférence de langue": "Language preference",
    "(stockage local du navigateur) : mémorise votre choix FR/EN pour vous réafficher le simulateur dans la bonne langue ;": "(browser local storage): remembers your FR/EN choice so the simulator is shown to you in the right language;",
    "Paramètres de campagne": "Campaign parameters",
    "(UTM, stockage local) : conservés le temps de votre visite pour rattacher votre demande à son canal d'origine, dans le cadre du traitement de votre simulation ;": "(UTM, local storage): kept for the duration of your visit to attribute your request to its original channel, as part of processing your simulation;",
    "Protection anti-robots": "Bot protection",
    ": le service Cloudflare Turnstile peut déposer des informations techniques strictement nécessaires à la sécurité du formulaire ;": ": the Cloudflare Turnstile service may store technical information strictly necessary to the security of the form;",
    "Mesure d'audience respectueuse de la vie privée": "Privacy-friendly audience measurement",
    ": nous utilisons": ": we use",
    "pour des statistiques agrégées et anonymes (nombre de visites, pages vues),": "for aggregated and anonymous statistics (number of visits, page views),",
    "sans cookie, sans donnée personnelle et sans suivi entre sites": "with no cookie, no personal data and no cross-site tracking",
    ". Cet outil respecte les critères d'exemption de la CNIL et ne nécessite donc pas votre consentement.": ". This tool meets the exemption criteria of the CNIL, the French data protection authority, and therefore does not require your consent.",
    "Les polices d'écriture sont": "The fonts are",
    "hébergées sur notre propre serveur": "hosted on our own server",
    ": aucune donnée n'est transmise à un service de polices tiers lors de votre visite. Si nous mettions en place, à l'avenir, une mesure nécessitant votre consentement, celui-ci vous serait demandé au préalable.": ": no data is sent to a third-party font service during your visit. Should we introduce, in the future, any measure requiring your consent, it would be requested from you beforehand.",
    "7. Durée de conservation": "7. Retention period",
    "Les coordonnées des prospects sont conservées au maximum 36 mois à compter de votre dernier contact avec nous, conformément aux durées recommandées pour la prospection commerciale. La photo de votre espace que vous avez importée, ainsi que les visuels générés (rendus de votre simulation), sont conservés le temps de votre relation commerciale avec nous et supprimés automatiquement au-delà de 36 mois. Ils ne sont ni partagés avec des tiers, ni utilisés à d'autres fins que la préparation et le suivi de votre projet d'aménagement. Vous pouvez à tout moment demander la suppression anticipée de vos données (voir vos droits ci-dessous).": "Prospect contact details are kept for a maximum of 36 months from your last contact with us, in line with the durations recommended for commercial prospecting. The photo of your space that you uploaded, along with the generated visuals (renderings of your simulation), are kept for the duration of your commercial relationship with us and automatically deleted beyond 36 months. They are neither shared with third parties nor used for any purpose other than preparing and following up on your interior project. You may request early deletion of your data at any time (see your rights below).",
    "8. Vos droits": "8. Your rights",
    "Conformément au Règlement Général sur la Protection des Données (RGPD), vous disposez d'un droit d'accès, de rectification, d'effacement, de limitation, d'opposition et de portabilité de vos données. Vous pouvez exercer ces droits en nous contactant à": "Under the General Data Protection Regulation (GDPR), you have the right to access, rectify, erase, restrict, object to and port your data. You may exercise these rights by contacting us at",
    ". Vous disposez également du droit d'introduire une réclamation auprès de la CNIL (": ". You also have the right to lodge a complaint with the CNIL, the French data protection authority (",
    "9. Sécurité": "9. Security",
    "Nous mettons en œuvre les mesures techniques et organisationnelles appropriées pour protéger vos données contre tout accès non autorisé, perte ou divulgation.": "We implement appropriate technical and organisational measures to protect your data against unauthorised access, loss or disclosure."
  };

  function tr(s) {
    if (LANG !== 'en' || s == null) return s;
    var key = String(s).replace(/\s+/g, ' ').trim();
    return Object.prototype.hasOwnProperty.call(EN, key) ? EN[key] : s;
  }


  // Le switch est fait de vrais LIENS, pas de boutons JS. Deux raisons : la langue EST le
  // chemin, donc changer de langue = changer de page ; et un <a href> entre les deux versions
  // est crawlable, ce qui est precisement ce qu'un couple hreflang attend.
  function buildSwitch() {
    var header = document.querySelector('.header');
    if (!header || document.getElementById('lang-switch')) return;
    var wrap = document.createElement('div');
    wrap.id = 'lang-switch';
    wrap.setAttribute('role', 'group');
    wrap.setAttribute('aria-label', 'Language / Langue');
    wrap.style.cssText = 'display:inline-flex;gap:2px;align-items:center;margin-left:auto;margin-right:12px;font-family:Helvetica,Arial,sans-serif;font-size:12px;font-weight:600;letter-spacing:.04em';
    [['fr', '/'], ['en', '/en/']].forEach(function (pair) {
      var l = pair[0], on = (LANG === l);
      var a = document.createElement('a');
      a.textContent = l.toUpperCase();
      a.href = pair[1];
      a.setAttribute('hreflang', l);
      if (on) a.setAttribute('aria-current', 'true');
      a.style.cssText = 'text-decoration:none;cursor:pointer;background:' + (on ? '#B87D4B' : 'transparent') + ';color:' + (on ? '#fff' : '#8a7a66') + ';padding:4px 9px;border-radius:6px;line-height:1;transition:background .15s';
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
    var nav = ((navigator.languages && navigator.languages[0]) || navigator.language || 'fr').toLowerCase();
    if (nav.indexOf('fr') === 0) return;
    try { if (localStorage.getItem('bal_en_offer') === 'off') return; } catch (e) {}
    var bar = document.createElement('div');
    bar.id = 'en-offer';
    bar.style.cssText = 'position:fixed;left:0;right:0;bottom:0;z-index:1000;background:#2A1F14;color:#fff;padding:11px 16px;display:flex;align-items:center;justify-content:center;gap:14px;font-family:Helvetica,Arial,sans-serif;font-size:14px';
    var a = document.createElement('a');
    a.href = '/en/'; a.textContent = 'Read this page in English \u2192';
    a.style.cssText = 'color:#F5D49A;text-decoration:none;font-weight:600';
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
    var metaEN = {
      'description': "Interior design and layout simulator: upload a photo of your living room, terrace or garden and receive a solid teak rendering with a quote. Free.",
      'og:title': "Your space, elevated by teak · Balinaisa",
      'twitter:title': "Your space, elevated by teak · Balinaisa",
      'og:description': "One photo is enough: Balinaisa.ai places Balinaisa teak furniture in your space and sends you a quote. Free, no commitment.",
      'twitter:description': "One photo is enough: Balinaisa.ai places Balinaisa teak furniture in your space and sends you a quote. Free, no commitment."
    };
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
