/* Lecteur unique du dictionnaire de i18n.js.
 *
 * Deux consommateurs : tools/check-i18n.js (cles orphelines) et tools/build-en.js
 * (generation de /en/). Ils DOIVENT lire le dico de la meme facon, sinon le controle
 * valide un dico que le generateur lit autrement : c'est exactement la classe de bug
 * que le controle existe pour empecher.
 *
 * On evalue le LITTERAL objet plutot que de le lire a la regex : echappements,
 * apostrophes, accents, aucune divergence possible avec ce que le navigateur parse.
 */
'use strict';

const fs = require('fs');
const vm = require('vm');

/* Index du quote fermant la chaine ouverte a `start`. */
function endOfString(src, start) {
  const q = src[start];
  for (let i = start + 1; i < src.length; i++) {
    if (src[i] === '\\') { i++; continue; }
    if (src[i] === q) return i;
  }
  return src.length;
}

/* Index du '}' fermant le '{' ouvert a `open`, en ignorant les accolades
   qui vivent dans une chaine ou un commentaire. */
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

/* Evalue le litteral objet qui suit `decl` dans `src`. */
function readLiteral(src, decl, label, file) {
  const at = src.indexOf(decl);
  if (at === -1) throw new Error(`bloc "${decl}" introuvable dans ${file}`);
  const open = src.indexOf('{', at);
  const close = matchBrace(src, open);
  if (close === -1) throw new Error(`accolade fermante du bloc ${label} introuvable dans ${file}`);
  try {
    return vm.runInNewContext('(' + src.slice(open, close + 1) + ')', Object.create(null), { timeout: 1000 });
  } catch (e) {
    throw new Error(`le bloc ${label} de ${file} n'est pas un litteral objet valide : ${e.message}`);
  }
}

/* { EN, metaEN } tels que le navigateur les voit.
   EN     : dico FR -> EN des textes et attributs.
   metaEN : surcharges des <meta> (description, og, twitter), qui ne passent pas par EN. */
function readDict(dictFile) {
  const src = fs.readFileSync(dictFile, 'utf8');
  return {
    EN: readLiteral(src, 'var EN = {', 'EN', dictFile),
    metaEN: readLiteral(src, 'var metaEN = {', 'metaEN', dictFile),
  };
}

module.exports = { readDict, matchBrace, endOfString };
