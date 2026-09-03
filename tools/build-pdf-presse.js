#!/usr/bin/env node
/* Rend les PDF de l'espace presse depuis leurs masters HTML.
 *
 *   node tools/build-pdf-presse.js              les deux
 *   node tools/build-pdf-presse.js synthese     un seul
 *
 * POURQUOI CE SCRIPT EXISTE
 * Il n'y avait aucune chaine PDF dans ce depot : le communique de presse a ete
 * produit ailleurs, et rien ne permettait de le refabriquer. Les masters sont
 * donc du HTML mis en page pour l'impression, partageant tools/print-charte-v04.css,
 * et rendus par Chromium. Refaire un PDF apres une correction de texte se resume
 * a relancer cette commande, et la charte se reutilise en CSS au lieu d'etre
 * reinterpretee dans un outil de PAO.
 *
 * QUATRE PIEGES, tous verifies sur le rendu et pas seulement sur la page :
 *   1. printBackground. Sans lui Chromium retire les aplats et le document sort
 *      blanc sur blanc : plus de panneaux ivoire, plus de fonds de schema. Le CSS
 *      porte en plus `print-color-adjust: exact`, les deux sont necessaires.
 *   2. Les polices. Les masters les chargent depuis fonts/ en file://, donc sans
 *      reseau ; on attend quand meme document.fonts.ready, sinon Chromium peut
 *      imprimer avec le repli Georgia et personne ne le voit.
 *   3. preferCSSPageSize, pour que le @page de la charte fasse foi sur les
 *      marges plutot que les valeurs par defaut de Playwright.
 *   4. Une image cassee n'interrompt pas la navigation : Chromium l'imprime en
 *      cadre vide, sans un mot. On la controle explicitement, et une image
 *      manquante fait sortir le script en code 1.
 *
 * Le nombre de pages attendu est declare ci-dessous et VERIFIE : une correction
 * de texte qui fait deborder la synthese sur une 3e page doit se voir tout de
 * suite, c'est la contrainte du format.
 *
 * A SAVOIR : la sortie n'est PAS reproductible a l'octet. Chromium ecrit une
 * date de creation dans le PDF, donc relancer ce script sans avoir touche au
 * texte laisse quand meme les PDF « modifies » dans git. Avant de committer un
 * PDF, comparer le CONTENU et non les octets, par exemple avec pymupdf :
 * meme nombre de pages, meme get_text() page par page, meme empreinte de
 * get_pixmap(). Si le contenu est identique, `git checkout --` sur le PDF
 * plutot qu'un commit de bruit.
 */
'use strict';

const path = require('path');
const fs = require('fs');

const ROOT = path.resolve(__dirname, '..');

const DOCS = {
  'note-technique': {
    master: 'tools/note-technique-print.html',
    sortie: 'presse/balinaisa-ai_note-technique.pdf',
    pied: 'Balinaisa.ai · Note technique · Septembre 2026',
    pagesMax: 6,
  },
  synthese: {
    master: 'tools/note-technique-synthese-print.html',
    sortie: 'presse/balinaisa-ai_note-technique-synthese.pdf',
    pied: 'Balinaisa.ai · Synthèse technique · Septembre 2026',
    pagesMax: 2,
  },
};

/* Playwright est installe globalement dans ces conteneurs, pas dans le depot :
   ce depot n'a aucun package.json et on ne va pas lui en ajouter un pour un
   script de fabrication. On le cherche donc aussi dans les chemins globaux. */
function loadPlaywright() {
  for (const dir of ['/opt/node22/lib/node_modules', '/usr/lib/node_modules', '/usr/local/lib/node_modules']) {
    if (!module.paths.includes(dir)) module.paths.push(dir);
  }
  try {
    return require('playwright');
  } catch (e) {
    console.error('playwright introuvable. Installer avec : npm i -g playwright');
    process.exit(1);
  }
}

const pied = (texte) => `
<div style="width:100%;font-family:Helvetica,Arial,sans-serif;font-size:7pt;color:#6F685B;
            padding:0 18mm;display:flex;justify-content:space-between;align-items:center">
  <span>${texte}</span>
  <span><span class="pageNumber"></span> / <span class="totalPages"></span></span>
</div>`;

async function rendre(browser, nom, doc) {
  const src = path.join(ROOT, doc.master);
  if (!fs.existsSync(src)) throw new Error('master introuvable : ' + doc.master);

  const page = await browser.newPage();
  const anomalies = [];
  page.on('pageerror', (e) => anomalies.push('pageerror: ' + e.message));
  page.on('requestfailed', (r) => anomalies.push('requete echouee: ' + r.url()));

  await page.goto('file://' + src, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);

  const images = await page.evaluate(() =>
    [...document.images].map((i) => ({ src: i.getAttribute('src'), ok: i.complete && i.naturalWidth > 0 })));
  const cassees = images.filter((i) => !i.ok);

  const out = path.join(ROOT, doc.sortie);
  await page.pdf({
    path: out,
    printBackground: true,
    preferCSSPageSize: true,
    displayHeaderFooter: true,
    headerTemplate: '<span></span>',
    footerTemplate: pied(doc.pied),
    margin: { top: '19mm', right: '18mm', bottom: '17mm', left: '18mm' },
  });
  await page.close();

  const buf = fs.readFileSync(out);
  const pages = (buf.toString('latin1').match(/\/Type\s*\/Page[^s]/g) || []).length;

  console.log(`${nom} : ${doc.sortie}  ${(buf.length / 1024).toFixed(0)} Ko, ${pages} page(s), `
    + `${images.length - cassees.length}/${images.length} image(s)`);

  const echecs = [];
  if (cassees.length) echecs.push('images cassees : ' + cassees.map((i) => i.src).join(', '));
  if (anomalies.length) echecs.push(anomalies.join(' | '));
  if (pages > doc.pagesMax) {
    echecs.push(`${pages} pages alors que le format en admet ${doc.pagesMax} au maximum`);
  }
  return echecs;
}

(async () => {
  const demande = process.argv[2];
  if (demande && !DOCS[demande]) {
    console.error('Document inconnu. Attendu : ' + Object.keys(DOCS).join(', '));
    process.exit(1);
  }
  const aFaire = demande ? [demande] : Object.keys(DOCS);

  const { chromium } = loadPlaywright();
  const browser = await chromium.launch();

  let echecs = [];
  for (const nom of aFaire) {
    echecs = echecs.concat((await rendre(browser, nom, DOCS[nom])).map((e) => nom + ' : ' + e));
  }
  await browser.close();

  if (echecs.length) {
    console.error('\nECHECS :');
    echecs.forEach((e) => console.error('  ' + e));
    process.exit(1);
  }
})();
