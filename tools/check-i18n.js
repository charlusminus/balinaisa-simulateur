#!/usr/bin/env node
'use strict';

/* Controle des cles orphelines du dictionnaire EN (i18n.js).
 *
 * Pourquoi : i18n.js utilise la phrase FR entiere comme cle. Si un texte FR change
 * dans index.html sans que la cle soit changee a l'identique, tr() ne trouve plus
 * l'entree et renvoie le FR : les anglophones voient du francais, sans aucune erreur
 * console. C'est arrive avec le <title> (PR #11, corrige le 17/07).
 *
 * Principe : toute cle du dico doit correspondre a un texte reellement rendu
 * (noeud de texte / attribut / <title> d'un *.html, ou litteral d'un *.js).
 * Une cle qui ne correspond a rien est ORPHELINE -> echec.
 *
 * Les textes volontairement absents du rendu (categories du catalogue en reserve,
 * UI retiree) vivent dans tools/i18n-allowlist.json, avec une raison obligatoire.
 *
 * Usage : node tools/check-i18n.js [racine]   (defaut : racine du repo)
 * Sortie : 0 = OK, 1 = cles orphelines, 2 = erreur du controle lui-meme.
 */

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.resolve(process.argv[2] || path.join(__dirname, '..'));
const DICT_FILE = path.join(ROOT, 'i18n.js');
const ALLOW_FILE = path.join(__dirname, 'i18n-allowlist.json');
const ALLOW_REL = 'tools/i18n-allowlist.json'; // pour les messages : ALLOW_FILE suit le script, pas la racine analysee

/* Meme normalisation que i18n.js (tr() et applyDOM) : \s+ -> espace, puis trim.
   Node et le navigateur partagent la semantique de \s (y compris &nbsp; U+00A0),
   donc une cle jugee atteignable ici l'est aussi dans le navigateur. */
const norm = (s) => String(s).replace(/\s+/g, ' ').trim();

/* ------------------------------------------------------------------ *
 * Lecture du dictionnaire
 * ------------------------------------------------------------------ */

/* Renvoie l'index du '}' fermant le '{' ouvert a `open`, en ignorant
   les accolades qui vivent dans une chaine ou un commentaire. */
function matchBrace(src, open) {
  let depth = 0;
  for (let i = open; i < src.length; i++) {
    const c = src[i];
    if (c === '/' && src[i + 1] === '/') { i = src.indexOf('\n', i); if (i === -1) break; continue; }
    if (c === '/' && src[i + 1] === '*') { i = src.indexOf('*/', i + 2) + 1; continue; }
    if (c === '"' || c === "'" || c === '`') { i = endOfString(src, i); continue; }
    if (c === '{') depth++;
    else if (c === '}' && --depth === 0) return i;
  }
  return -1;
}

/* Index du quote fermant la chaine ouverte a `start`. */
function endOfString(src, start) {
  const q = src[start];
  for (let i = start + 1; i < src.length; i++) {
    if (src[i] === '\\') { i++; continue; }
    if (src[i] === q) return i;
  }
  return src.length;
}

/* Les cles du dico, telles que le navigateur les parse : on evalue le litteral
   objet lui-meme plutot que de le lire a la regex (echappements, apostrophes,
   accents : aucune divergence possible avec le runtime). */
function readDictKeys() {
  const src = fs.readFileSync(DICT_FILE, 'utf8');
  const decl = src.indexOf('var EN = {');
  if (decl === -1) throw new Error(`bloc "var EN = {" introuvable dans ${DICT_FILE}`);
  const open = src.indexOf('{', decl);
  const close = matchBrace(src, open);
  if (close === -1) throw new Error(`accolade fermante du bloc EN introuvable dans ${DICT_FILE}`);
  const literal = src.slice(open, close + 1);
  let obj;
  try {
    obj = vm.runInNewContext('(' + literal + ')', Object.create(null), { timeout: 1000 });
  } catch (e) {
    throw new Error(`le bloc EN de ${DICT_FILE} n'est pas un litteral objet valide : ${e.message}`);
  }
  return Object.keys(obj);
}

/* ------------------------------------------------------------------ *
 * Extraction des textes candidats
 * ------------------------------------------------------------------ */

const JS_ESCAPES = { n: '\n', r: '\r', t: '\t', b: '\b', f: '\f', v: '\v', '0': '\0' };

function decodeJsEscapes(raw) {
  let out = '';
  for (let i = 0; i < raw.length; i++) {
    if (raw[i] !== '\\') { out += raw[i]; continue; }
    const c = raw[++i];
    if (c === 'u') {
      if (raw[i + 1] === '{') {
        const end = raw.indexOf('}', i);
        out += String.fromCodePoint(parseInt(raw.slice(i + 2, end), 16) || 0);
        i = end;
      } else {
        out += String.fromCharCode(parseInt(raw.substr(i + 1, 4), 16) || 0);
        i += 4;
      }
    } else if (c === 'x') {
      out += String.fromCharCode(parseInt(raw.substr(i + 1, 2), 16) || 0);
      i += 2;
    } else if (c === '\n') { /* continuation de ligne */ }
    else out += (JS_ESCAPES[c] !== undefined ? JS_ESCAPES[c] : c);
  }
  return out;
}

/* Tous les litteraux chaine d'une source JS.
 *
 * Le piege des faux positifs est ici : les messages de simulator.js sont
 * construits dynamiquement. Il faut donc
 *   - les trois types de quotes (' " `), apostrophes francaises comprises ;
 *   - les morceaux statiques des template literals ;
 *   - une descente DANS les `${...}` : `${T('Étape')} ${step} / 4` cache un
 *     litteral que tout scan qui avale le template d'un bloc laisse passer.
 * Les commentaires sont sautes (ils contiennent des apostrophes qui
 * desynchroniseraient le scan).
 *
 * Limite connue : les litteraux regex ne sont pas reconnus comme tels. Aucun
 * de ceux du repo ne contient de quote ; si ca changeait, le scan se
 * desynchroniserait (et le controle deviendrait bruyant, pas silencieux).
 */
function jsStrings(src) {
  const out = [];
  for (let i = 0; i < src.length; i++) {
    const c = src[i];
    if (c === '/' && src[i + 1] === '/') { const nl = src.indexOf('\n', i); if (nl === -1) break; i = nl; continue; }
    if (c === '/' && src[i + 1] === '*') { const end = src.indexOf('*/', i + 2); if (end === -1) break; i = end + 1; continue; }
    if (c === '"' || c === "'") {
      const end = endOfString(src, i);
      out.push(decodeJsEscapes(src.slice(i + 1, end)));
      i = end;
      continue;
    }
    if (c === '`') {
      const end = endOfString(src, i);
      const body = src.slice(i + 1, end);
      // morceaux statiques + recursion dans chaque ${...}
      let chunk = '';
      for (let j = 0; j < body.length; j++) {
        if (body[j] === '\\') { chunk += body[j] + (body[j + 1] || ''); j++; continue; }
        if (body[j] === '$' && body[j + 1] === '{') {
          const close = matchBrace(body, j + 1);
          if (close === -1) break;
          out.push(...jsStrings(body.slice(j + 2, close)));
          out.push(decodeJsEscapes(chunk));
          chunk = '';
          j = close;
          continue;
        }
        chunk += body[j];
      }
      out.push(decodeJsEscapes(chunk));
      i = end;
      continue;
    }
  }
  return out;
}

const NAMED_ENTITIES = {
  amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ',
  laquo: '«', raquo: '»', hellip: '…', eacute: 'é',
  egrave: 'è', agrave: 'à', ccedil: 'ç', rsquo: '’',
  ldquo: '“', rdquo: '”', middot: '·', euro: '€',
};

function decodeEntities(s) {
  return s.replace(/&(#x?[0-9a-fA-F]+|[a-zA-Z][a-zA-Z0-9]*);/g, (m, body) => {
    if (body[0] === '#') {
      const cp = body[1] === 'x' || body[1] === 'X'
        ? parseInt(body.slice(2), 16)
        : parseInt(body.slice(1), 10);
      return Number.isFinite(cp) ? String.fromCodePoint(cp) : m;
    }
    const named = NAMED_ENTITIES[body];
    return named !== undefined ? named : m; // entite inconnue : laissee telle quelle
  });
}

const TRANSLATED_ATTRS = ['placeholder', 'aria-label', 'alt', 'title', 'value', 'content'];

/* Textes candidats d'une page HTML : noeuds de texte hors commentaires,
   attributs traduits par applyDOM, et <title>. Les <script> sont traites
   comme du JS, les <style> ignores. */
function htmlCandidates(src) {
  const out = [];
  src = src.replace(/<!--[\s\S]*?-->/g, ' '); // UI commentee = UI non rendue
  src = src.replace(/<script\b[^>]*>([\s\S]*?)<\/script\s*>/gi, (m, body) => {
    out.push(...jsStrings(body));
    return ' ';
  });
  src = src.replace(/<style\b[^>]*>[\s\S]*?<\/style\s*>/gi, ' ');

  const titre = /<title\b[^>]*>([\s\S]*?)<\/title\s*>/i.exec(src);
  if (titre) out.push(titre[1]);

  for (const tag of src.match(/<[^>]*>/g) || []) {
    for (const attr of TRANSLATED_ATTRS) {
      const re = new RegExp('\\b' + attr + '\\s*=\\s*("([^"]*)"|\'([^\']*)\')', 'gi');
      let m;
      while ((m = re.exec(tag))) out.push(m[2] !== undefined ? m[2] : m[3]);
    }
  }
  out.push(...src.split(/<[^>]*>/)); // noeuds de texte
  return out;
}

/* ------------------------------------------------------------------ *
 * Controle
 * ------------------------------------------------------------------ */

function sourceFiles() {
  return fs.readdirSync(ROOT)
    .filter((f) => /\.(html|js)$/i.test(f))
    .filter((f) => f !== 'i18n.js') // le dico se contient lui-meme : tout y matcherait
    .sort()
    .map((f) => path.join(ROOT, f));
}

function collectCandidates(files) {
  const seen = new Set();
  for (const file of files) {
    const src = fs.readFileSync(file, 'utf8');
    const raw = /\.html$/i.test(file) ? htmlCandidates(src) : jsStrings(src);
    for (const s of raw) {
      if (!s || !s.trim()) continue;
      // Forme brute ET forme decodee : le dico contient les deux graphies
      // (« &amp; » cote source, « & » cote DOM) et les deux sont legitimes.
      seen.add(norm(s));
      seen.add(norm(decodeEntities(s)));
    }
  }
  return seen;
}

/* Deux listes, deux regimes :
   - catalogue : vocabulaire produit. Une categorie entre et sort du slider au gre
     des arrivages, c'est editorial et frequent. Absence = normal, jamais signalee.
   - exemptions : cas particuliers, un par un, raison obligatoire. Signalees quand
     elles redeviennent inutiles, pour que la liste ne pourrisse pas. */
function readAllowlist() {
  const rel = ALLOW_REL;
  let parsed;
  try {
    parsed = JSON.parse(fs.readFileSync(ALLOW_FILE, 'utf8'));
  } catch (e) {
    throw new Error(`${rel} illisible : ${e.message}`);
  }

  const cat = parsed.catalogue;
  if (!cat || !Array.isArray(cat.keys) || typeof cat.reason !== 'string' || !cat.reason.trim()) {
    throw new Error(`${rel} : "catalogue" veut { "reason": ..., "keys": [...] }`);
  }
  const catalogue = new Set(cat.keys.map(norm));

  if (!Array.isArray(parsed.exemptions)) throw new Error(`${rel} : champ "exemptions" (tableau) attendu`);
  const exemptions = new Map();
  for (const e of parsed.exemptions) {
    if (!e || typeof e.key !== 'string' || typeof e.reason !== 'string' || !e.reason.trim()) {
      throw new Error(`${rel} : chaque exemption veut { "key": ..., "reason": ... } non vide, recu ${JSON.stringify(e)}`);
    }
    exemptions.set(norm(e.key), e.reason);
  }
  return { catalogue, exemptions };
}

function main() {
  const keys = readDictKeys();
  const { catalogue, exemptions } = readAllowlist();
  const files = sourceFiles();
  const candidates = collectCandidates(files);

  const orphans = [];
  const unreachable = []; // cle non normalisee : tr() ne peut pas la trouver
  const usedExemptions = new Set();

  for (const key of keys) {
    const k = norm(key);
    if (candidates.has(k)) {
      if (key !== k) unreachable.push(key);
      continue;
    }
    if (catalogue.has(k)) continue;
    if (exemptions.has(k)) { usedExemptions.add(k); continue; }
    orphans.push(key);
  }

  const dictKeys = new Set(keys.map(norm));
  const staleAllow = [...exemptions.keys()].filter((k) => !usedExemptions.has(k) && (candidates.has(k) || !dictKeys.has(k)));

  console.log(`i18n : ${keys.length} cles EN, ${candidates.size} textes candidats dans ${files.length} fichiers (${files.map((f) => path.basename(f)).join(', ')}).`);

  if (staleAllow.length) {
    console.log('');
    console.log(`Note (sans incidence) : ${staleAllow.length} exemption(s) inutile(s) dans ${ALLOW_REL}, le texte est revenu au rendu ou la cle a quitte le dico. A retirer :`);
    for (const k of staleAllow) console.log(`  - ${JSON.stringify(k)}`);
  }

  if (unreachable.length) {
    console.log('');
    console.error(`${unreachable.length} cle(s) NON NORMALISEE(S) : tr() normalise avant de chercher, une cle avec espace en trop ou retour a la ligne n'est jamais trouvee (meme effet qu'une orpheline : l'anglophone voit du francais).`);
    for (const key of unreachable) console.error(`  - ${JSON.stringify(key)}\n    -> ecrire ${JSON.stringify(norm(key))}`);
  }

  if (orphans.length) {
    console.log('');
    console.error(`${orphans.length} cle(s) ORPHELINE(S) : aucun texte rendu ne leur correspond, donc tr() renvoie le francais aux anglophones.`);
    for (const key of orphans) console.error(`  - ${JSON.stringify(key)}`);
    console.error('');
    console.error('Corriger selon le cas :');
    console.error(`  - le texte FR a change : reporter le nouveau texte, a l'identique, en cle dans i18n.js ;`);
    console.error(`  - le texte n'est plus affiche mais l'entree doit rester : l'ajouter a ${ALLOW_REL} avec sa raison ;`);
    console.error(`  - l'entree ne sert plus : la retirer de i18n.js.`);
  }

  if (orphans.length || unreachable.length) process.exit(1);
  console.log('OK : chaque cle EN correspond a un texte rendu.');
}

try {
  main();
} catch (e) {
  console.error(`check-i18n : ${e.message}`);
  process.exit(2);
}
