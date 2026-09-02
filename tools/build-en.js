#!/usr/bin/env node
/* Genere les pages de /en/ depuis leur source FR + le dictionnaire de i18n.js.
 *
 * POURQUOI GENERER PLUTOT QUE DUPLIQUER
 * Une page anglaise ecrite a la main, c'est deux fichiers a tenir en parallele. La premiere
 * fois qu'on change une phrase FR sans toucher l'autre, les deux divergent en silence : c'est
 * exactement le bug que check-i18n.js existe pour empecher, mais en pire (il serait cuit dans
 * une page indexee par Google). Ici i18n.js reste la SOURCE DE VERITE unique des traductions.
 *
 * POURQUOI /en/ EXISTE
 * L'i18n etait client-side : Googlebot ne voyait qu'une page, en francais. Aucun anglophone
 * ne pouvait trouver le simulateur par une recherche, alors que 41% de la base est hors France
 * (57 pays, 194 demandes en anglais). /en/ est une vraie page servie en anglais, indexable.
 *
 * PLUSIEURS PAGES (29/07)
 * Le generateur ne traitait que index.html. La politique de confidentialite restait donc en
 * francais uniquement, alors que l'email client y renvoie desormais tous les leads, anglophones
 * compris. Elle est ajoutee a PAGES plutot qu'ecrite a la main, pour la meme raison qu'au-dessus :
 * un texte legal duplique est un texte legal qui finit par se contredire d'une langue a l'autre.
 *
 * CE FICHIER EST COMMITE, PAS SEULEMENT GENERE AU BUILD
 * Pour qu'il soit relisible en PR. La CI le regenere et compare : si quelqu'un touche
 * une source sans relancer le generateur, la CI bloque. Voir --check.
 *
 *   node tools/build-en.js           ecrit les pages de /en/
 *   node tools/build-en.js --check   verifie qu'elles sont a jour, sans ecrire (code 1 sinon)
 */
'use strict';

const fs = require('fs');
const path = require('path');
const { readDict } = require('./i18n-dict.js');

const ROOT = path.join(__dirname, '..');
const OUT_DIR = path.join(ROOT, 'en');
const CHECK = process.argv.includes('--check');
const ORIGIN = 'https://balinaisa.ai';

/* Pages a generer. `canonical` sert au couple hreflang ; il reste null pour une page en
   noindex, qui n'a ni canonical ni alternate a declarer. */
const PAGES = [
  { src: 'index.html', out: 'index.html', canonical: ORIGIN + '/en/', frUrl: ORIGIN + '/' },
  { src: 'privacy-policy.html', out: 'privacy-policy.html', canonical: null, frUrl: null },
  /* metaFromFr : cette page a ses propres meta. Le `metaEN` global decrit le simulateur ;
     l'appliquer ici collerait la description du simulateur sur le communique de presse.
     On traduit donc chaque meta par le dictionnaire, comme n'importe quel autre texte. */
  { src: 'presse/index.html', out: 'presse/index.html', canonical: ORIGIN + '/en/presse/', frUrl: ORIGIN + '/presse/', metaFromFr: true },
];

/* Reecriture des liens INTERNES pour la version anglaise : un lien vers index.html doit
   emmener un anglophone sur /en/, pas le renvoyer en francais. Sans cette table, la page
   anglaise se comporte comme une impasse : on y entre, et le premier clic ramene au FR. */
const EN_LINKS = {
  'index.html': '/en/',
  'privacy-policy.html': '/en/privacy-policy.html',
};

/* Liens ABSOLUS vers une page traduite. L'etape 4 ne rattrape que les liens RELATIFS, et une
   page rangee dans un sous-repertoire (/presse/) doit ecrire les siens en absolu pour rester
   valides depuis /en/presse/ : ils passeraient donc a cote de la traduction. Sans cette table,
   la page anglaise de l'espace presse renvoie ses lecteurs vers le simulateur en francais. */
const EN_LINKS_ABS = {
  '/': '/en/',
  '/privacy-policy.html': '/en/privacy-policy.html',
  '/presse/': '/en/presse/',
  /* Sans cette ligne, installer l application depuis /en/ prendrait le manifeste FR,
     dont le start_url est « / » : l application se lancerait en francais. */
  '/site.webmanifest': '/site.en.webmanifest',
};

const norm = (s) => String(s).replace(/\s+/g, ' ').trim();
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const { EN, metaEN } = readDict(path.join(ROOT, 'i18n.js'));

/* Garde-fou : une page anglaise qui contient encore du francais est un echec silencieux. */
/* Mots choisis pour n'avoir AUCUN homographe anglais : « photo », « de », « en » ou « son »
   en feraient un controle bruyant, qui finirait desactive. Les seconds ajoutes le 25/08 sont
   le vocabulaire du bloc de donnees structurees (une FAQ produit), la ou il manquait. */
const FR = /\b(votre|vos|une|des|avec|pour|dans|gratuit|gratuite|sans|photographiez|imagine|aménagement|espace|pièce|chaque|nous|vous|les|est|sont|aucun|aucune|cette|conserv|combien|coûte|mobilier|meubles|simulateur|devis|fonctionne|proposé|propose|quel|quelle|prix|selon|façonné|haut de gamme|estimatif)\b/i;

/* Noms propres et marques : ils s'ecrivent pareil dans les deux langues, leur presence ne dit
   rien de la langue de la phrase. On les RETIRE avant de tester, au lieu d'exempter la phrase
   entiere : « Combien coûte le mobilier Balinaisa ? » contient « Balinaisa », donc l'ancienne
   version l'exemptait en bloc et laissait passer une question de FAQ restee francaise. */
const EXEMPT = /Balinaisa|Dominique|Raynal|Marie Claire|Hanoi|Reza|Jaya|Nara|Lyodra|Kumala|Uma|Siti|Timor|Atalya|Paktiz|Plausible|CNIL|cnil\.fr|Cloudflare|Turnstile|Google|Indonesian|Arcachon/gi;

/* Ce qui reste d'une phrase une fois les noms propres retires. C'est la-dessus qu'on juge. */
const stripNames = (v) => v.replace(EXEMPT, ' ').replace(/\s+/g, ' ').trim();
const looksFrench = (v) => { const rest = stripNames(v); return rest.length > 3 && FR.test(rest); };
/* On ne met en reserve que le CONTENU de script/style : la balise ouvrante reste exposee,
   sinon l'etape 4 ne voit jamais son src. Le 02/09, <script src="i18n.js"> partait dans le
   trou avec sa balise : /en/ servait un 404 sur i18n.js ET simulator.js. Aucune erreur
   visible cote page, mais ni traduction runtime ni simulateur pour un anglophone. */
const SKIP = /(<(script|style)\b[^>]*>)([\s\S]*?)(<\/\2>)/gi;

/* Le bloc de donnees structurees. C'est un <script>, donc SKIP le mettait en reserve avec
   le reste du JS : il partait en anglais AVEC SON TEXTE FRANCAIS. Trois consequences, toutes
   invisibles (aucune erreur, la page s'affiche bien) :
     1. la FAQPage de /en/ decrivait des questions francaises alors que la FAQ affichee est
        en anglais. Google demande que les donnees structurees correspondent au contenu VISIBLE ;
        la page anglaise etait donc en contradiction avec elle-meme.
     2. les noeuds WebApplication et FAQPage gardaient l'@id et l'url de la page FR : deux URL
        differentes declaraient les memes @id avec des contenus differents.
     3. la ligne qui repassait "inLanguage" en "en" s'executait pendant que le bloc etait en
        reserve : elle ne matchait donc jamais rien, et /en/ annoncait "inLanguage": "fr".
   On le traite donc explicitement, AVANT la mise en reserve, avec la meme discipline que le
   reste du fichier : on ne remplace un texte que s'il est une cle du dictionnaire. */
const LD = /(<script\b[^>]*type="application\/ld\+json"[^>]*>)([\s\S]*?)(<\/script>)/i;

/* Cles JSON dont la valeur est du texte editorial (donc traduisible). `name` couvre aussi
   le nom d'une Person ou d'un Review author : sans entree au dictionnaire, ils ne bougent pas. */
const LD_TEXT_KEYS = /"(name|description|text|headline|caption)":\s*"((?:[^"\\]|\\.)*)"/g;
/* Une URL de noeud : a repointer vers la page anglaise. `logo`/`image` en sont exclus (ce sont
   des fichiers, pas des pages) et l'Organization vit sur balinaisa.com (autre origine, intacte). */
const LD_URL_KEYS = /"(@id|url)":\s*"((?:[^"\\]|\\.)*)"/g;

const jsonUnesc = (raw) => JSON.parse('"' + raw + '"');
const jsonEsc = (v) => JSON.stringify(v).slice(1, -1);

function translateLd(html, page, stats) {
  return html.replace(LD, (m, open, json, close) => {
    json = json.replace(LD_TEXT_KEYS, (hit, key, raw) => {
      const dictKey = norm(jsonUnesc(raw));
      if (!dictKey || !Object.prototype.hasOwnProperty.call(EN, dictKey)) return hit;
      stats.ld++;
      return '"' + key + '": "' + jsonEsc(EN[dictKey]) + '"';
    });

    if (page.canonical) {
      json = json.replace(LD_URL_KEYS, (hit, key, raw) => {
        const url = jsonUnesc(raw);
        if (!url.startsWith(ORIGIN + '/')) return hit;   /* balinaisa.com : autre entite */
        stats.ld++;
        return '"' + key + '": "' + jsonEsc(page.canonical + url.slice(ORIGIN.length + 1)) + '"';
      });
    }

    json = json.replace(/"inLanguage":\s*"fr"/g, () => { stats.ld++; return '"inLanguage": "en"'; });
    return open + json + close;
  });
}

/* Fuites FR du bloc structure. `reviewBody` est exclu : un avis client est un verbatim, le
   traduire serait le reecrire. Il reste donc en francais, dans les deux langues. */
function ldLeaks(html) {
  const block = LD.exec(html);
  if (!block) return [];
  const out = [];
  block[2].replace(/"reviewBody":\s*"(?:[^"\\]|\\.)*"/g, ' ')
    .replace(LD_TEXT_KEYS, (m, key, raw) => {
      const v = norm(jsonUnesc(raw));
      if (looksFrench(v)) out.push(v.slice(0, 70));
      return m;
    });
  return out;
}

/* Typographie anglaise : pas d'espace avant « : ; ! ? ».
   Le francais en met une, et cette espace ne fait PAS partie du nœud de texte traduit :
   elle vit dans le HTML, entre la balise fermante et le texte (« </strong> : le service… »).
   Le dictionnaire ne peut donc pas la corriger, elle survit telle quelle dans la page
   anglaise. On la retire ici, et UNIQUEMENT dans les zones de texte : les commentaires,
   les scripts et les styles sont mis de cote le temps de la passe, sinon une regle CSS
   comme « margin : 0 » y passerait aussi. */
function typoAnglaise(html) {
  const garde = [];
  const masque = html.replace(/<!--[\s\S]*?-->|<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/g,
    (m) => { garde.push(m); return '\u0000' + (garde.length - 1) + '\u0000'; });
  const propre = masque
    .replace(/>(\s+)([:;!?])/g, '>$2')            /* « </strong> : texte » -> « </strong>: texte » */
    .replace(/([A-Za-z0-9\u00e0-\u00ff)\]"']) ([:;!?])(\s|<|$)/g, '$1$2$3');  /* « mot : » -> « mot : » */
  return propre.replace(/\u0000(\d+)\u0000/g, (m, i) => garde[Number(i)]);
}

/* Chaque chemin local de la page generee doit exister sur le disque. Ce filet est ne du
   02/09 : <script src="i18n.js"> restait relatif, /en/ demandait /en/i18n.js et /en/simulator.js,
   deux 404. La page s'affichait sans une erreur visible, mais un anglophone n'avait ni
   traduction runtime ni simulateur. Rien ne l'a signale pendant des semaines : ni --check
   (le fichier etait bien "a jour"), ni le detecteur de fuites, ni check-i18n. Un 404 n'est
   pas une fuite de texte, il faut donc le chercher pour lui-meme. */
function liensMorts(html) {
  const morts = [];
  const sansCommentaires = html.replace(/<!--[\s\S]*?-->/g, '');
  let m;
  const re = /\b(?:src|href)="([^"]+)"/g;
  while ((m = re.exec(sansCommentaires)) !== null) {
    const url = m[1];
    if (/^(https?:|\/\/|#|mailto:|tel:|data:)/.test(url)) continue;
    const chemin = url.split('?')[0].split('#')[0];
    if (!chemin) continue;
    /* Un chemin relatif dans /en/ est deja une anomalie : l'etape 4 aurait du l'absolutiser. */
    let disque = chemin.startsWith('/') ? path.join(ROOT, chemin.slice(1)) : null;
    if (disque === null) { morts.push(url + ' (relatif, non absolutise)'); continue; }
    if (disque.endsWith('/')) disque = path.join(disque, 'index.html');
    if (!fs.existsSync(disque)) morts.push(url);
  }
  return [...new Set(morts)];
}

function build(page) {
  let html = fs.readFileSync(path.join(ROOT, page.src), 'utf8');
  const stats = { texts: 0, attrs: 0, metas: 0, paths: 0, links: 0, ld: 0 };

  /* 0. Donnees structurees. AVANT la mise en reserve : sinon SKIP emporte le bloc intact. */
  html = translateLd(html, page, stats);

  /* 1. Textes. On ne touche qu'aux noeuds de texte, jamais au balisage. On saute
     script/style : leur contenu n'est pas du texte affiche, et simulator.js fait sa
     propre traduction via T() a l'execution. */
  const holes = [];
  html = html.replace(SKIP, (m, open, tag, body, close) => { holes.push(body); return open + ' HOLE' + (holes.length - 1) + ' ' + close; });

  html = html.replace(/>([^<>]+)</g, (m, text) => {
    const key = norm(text);
    if (!key || !Object.prototype.hasOwnProperty.call(EN, key)) return m;
    stats.texts++;
    return '>' + text.replace(key, EN[key]) + '<';
  });

  /* 2. Attributs. Meme liste que applyDOM, a l'identique. Si elle diverge, /en/ et le
     filet runtime ne traduisent pas les memes choses. */
  ['placeholder', 'aria-label', 'alt', 'title', 'value'].forEach((attr) => {
    const re = new RegExp('(\\s' + attr + '=")([^"]*)(")', 'g');
    html = html.replace(re, (m, a, v, c) => {
      const key = norm(v);
      if (!key || !Object.prototype.hasOwnProperty.call(EN, key)) return m;
      stats.attrs++;
      return a + esc(EN[key]) + c;
    });
  });

  /* 3. <title> et <meta> */
  html = html.replace(/<title>([\s\S]*?)<\/title>/i, (m, t) => {
    const key = norm(t);
    if (!Object.prototype.hasOwnProperty.call(EN, key)) return m;
    stats.metas++;
    return '<title>' + EN[key] + '</title>';
  });

  if (page.metaFromFr) {
    html = html.replace(/(<meta\s+(?:name|property)="(?:description|og:title|og:description|twitter:title|twitter:description)"\s+content=")([^"]*)(")/gi, (m, a, v, c) => {
      const key = norm(v);
      if (!Object.prototype.hasOwnProperty.call(EN, key)) return m;
      stats.metas++;
      return a + esc(EN[key]) + c;
    });
  } else {
    Object.keys(metaEN).forEach((k) => {
      const re = new RegExp('(<meta\\s+(?:name|property)="' + k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '"\\s+content=")([^"]*)(")', 'i');
      if (re.test(html)) { html = html.replace(re, (m, a, v, c) => a + esc(metaEN[k]) + c); stats.metas++; }
    });
  }

  /* 4. Liens internes vers une autre page traduite -> son equivalent /en/. A faire AVANT
     l'absolutisation, sinon "index.html" est deja devenu "/index.html" et ne matche plus. */
  html = html.replace(/\b(src|href)="(?!https?:|\/\/|\/|#|mailto:|tel:|data:)([^"]+)"/g, (m, attr, url) => {
    if (Object.prototype.hasOwnProperty.call(EN_LINKS, url)) { stats.links++; return attr + '="' + EN_LINKS[url] + '"'; }
    stats.paths++;
    return attr + '="/' + url + '"';   /* /en/x.html resout "styles.css" en /en/styles.css : 404 */
  });

  /* 4 bis. Les liens deja absolus vers une page qui a une version anglaise. */
  html = html.replace(/\bhref="(\/[^"]*)"/g, (m, url) => {
    if (!Object.prototype.hasOwnProperty.call(EN_LINKS_ABS, url)) return m;
    stats.links++;
    return 'href="' + EN_LINKS_ABS[url] + '"';
  });

  /* 5. lang, canonical, hreflang, og:url. UN CANONICAL AUTO-REFERENT PAR PAGE : c'est la
     condition pour que le couple hreflang soit valide. Le 16/07, ?lang=en pointait un
     canonical vers / : Google ignorait tout. Une page en noindex n'en declare aucun. */
  html = html.replace(/<html lang="fr">/i, '<html lang="en">');
  if (page.canonical) {
    html = html.replace(/<link rel="canonical" href="[^"]*">/i, '<link rel="canonical" href="' + page.canonical + '">');
    html = html.replace(/<meta property="og:url" content="[^"]*">/i, '<meta property="og:url" content="' + page.canonical + '">');
    html = html.replace(/<link rel="alternate" hreflang="fr"[^>]*>/i, '<link rel="alternate" hreflang="fr" href="' + page.frUrl + '">');
    html = html.replace(/<link rel="alternate" hreflang="en"[^>]*>/i, '<link rel="alternate" hreflang="en" href="' + page.canonical + '">');
  }
  html = html.replace(/<meta property="og:locale" content="[^"]*">/i, '<meta property="og:locale" content="en_GB">');

  holes.forEach((h, i) => { html = html.replace(' HOLE' + i + ' ', () => h); });

  const banner = '<!-- GENERE par tools/build-en.js depuis ' + page.src + ' + i18n.js. NE PAS EDITER A LA MAIN :\n     toute correction se fait dans ' + page.src + ' (structure) ou i18n.js (traduction), puis\n     `node tools/build-en.js`. La CI regenere et compare. -->\n';
  html = html.replace(/^<!DOCTYPE html>\n/i, '<!DOCTYPE html>\n' + banner);
  html = typoAnglaise(html);

  const body = html.slice(html.indexOf('<body')).replace(SKIP, '').replace(/<!--[\s\S]*?-->/g, '');
  const leaks = ldLeaks(html);   /* le bloc structure vit dans <head> : le scan du body ne le voit pas */
  body.replace(/>([^<>]+)</g, (m, t) => {
    const v = norm(t);
    if (looksFrench(v)) leaks.push(v.slice(0, 70));
    return m;
  });

  return { html, stats, leaks: [...new Set(leaks)], morts: liensMorts(html) };   /* meme phrase vue dans le corps ET dans le bloc structure : un seul signalement */
}

let failed = false;
fs.mkdirSync(OUT_DIR, { recursive: true });

PAGES.forEach((page) => {
  const { html, stats, leaks, morts } = build(page);
  const outPath = path.join(OUT_DIR, page.out);
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  const label = 'en/' + page.out;

  if (CHECK) {
    const cur = fs.existsSync(outPath) ? fs.readFileSync(outPath, 'utf8') : '';
    if (cur !== html) {
      console.error(label + ' n\'est PAS a jour. ' + page.src + ' ou i18n.js a change sans regeneration.');
      console.error('Lancer : node tools/build-en.js');
      failed = true;
    } else {
      console.log(label + ' est a jour.');
    }
  } else {
    fs.writeFileSync(outPath, html);
    console.log('%s ecrit : %d textes, %d attributs, %d metas, %d chemins absolutises, %d liens vers /en/, %d champs de donnees structurees.',
      label, stats.texts, stats.attrs, stats.metas, stats.paths, stats.links, stats.ld);
  }

  if (morts.length) {
    console.error('\nLIEN MORT dans ' + label + ' : ' + morts.length + ' chemin(s) local(aux) ne pointent sur rien :');
    morts.forEach((l) => console.error('  - ' + l));
    console.error('Un asset absent ne fait pas d\'erreur visible : la page s\'affiche, la fonction manque.');
    failed = true;
  }

  if (leaks.length) {
    console.error('\nFUITE FR dans ' + label + ' : ' + leaks.length + ' texte(s) francais survivent :');
    leaks.forEach((l) => console.error('  - ' + l));
    console.error('Chaque fuite = une phrase francaise servie a un anglophone. Ajouter la cle dans i18n.js.');
    failed = true;
  }
});

if (failed) process.exit(1);
if (!CHECK) console.log('Aucune fuite FR detectee.');
