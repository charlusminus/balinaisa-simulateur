#!/usr/bin/env node
/* Rend la note technique presse en PDF.
 *
 * POURQUOI CE SCRIPT EXISTE
 * Il n'y avait aucune chaine PDF dans ce depot : le communique de presse a ete
 * produit ailleurs, et rien ne permettait de le refabriquer. Le master
 * d'impression est donc du HTML (tools/note-technique-print.html), mis en page
 * avec la charte v0.4 en CSS plutot que reinterpretee dans un outil de PAO, et
 * rendu par Chromium. Refaire le PDF apres une correction de texte se resume a
 * relancer cette commande.
 *
 *   node tools/build-note-technique-pdf.js
 *
 * TROIS PIEGES, tous verifies sur le rendu et pas seulement sur la page :
 *   1. printBackground. Sans lui Chromium retire les aplats et le document sort
 *      blanc sur blanc : plus de panneaux ivoire, plus de fonds de schema.
 *      Le CSS porte en plus `print-color-adjust: exact`, les deux sont
 *      necessaires.
 *   2. Les polices. Le master les charge depuis fonts/ du depot en file://,
 *      donc sans reseau ; on attend quand meme document.fonts.ready, sinon
 *      Chromium peut imprimer avec le repli Georgia et personne ne le voit.
 *   3. preferCSSPageSize, pour que le @page du master fasse foi sur les marges
 *      plutot que les valeurs par defaut de Playwright.
 */
'use strict';

const path = require('path');
const fs = require('fs');

const ROOT = path.resolve(__dirname, '..');
const SRC = path.join(ROOT, 'tools', 'note-technique-print.html');
const OUT = path.join(ROOT, 'presse', 'balinaisa-ai_note-technique.pdf');

/* Playwright est installe globalement dans ces conteneurs, pas dans le depot :
   ce depot n'a aucun package.json et on ne va pas lui en ajouter un pour un
   script de fabrication. On le cherche donc aussi dans les chemins globaux. */
function loadPlaywright() {
  const extra = ['/opt/node22/lib/node_modules', '/usr/lib/node_modules', '/usr/local/lib/node_modules'];
  for (const dir of extra) {
    if (!module.paths.includes(dir)) module.paths.push(dir);
  }
  try {
    return require('playwright');
  } catch (e) {
    console.error("playwright introuvable. Installer avec : npm i -g playwright");
    process.exit(1);
  }
}

const gris = '#6F685B';
const footer = `
<div style="width:100%;font-family:Helvetica,Arial,sans-serif;font-size:7pt;color:${gris};
            padding:0 18mm;display:flex;justify-content:space-between;align-items:center">
  <span>Balinaisa.ai · Note technique · Septembre 2026</span>
  <span><span class="pageNumber"></span> / <span class="totalPages"></span></span>
</div>`;

(async () => {
  if (!fs.existsSync(SRC)) {
    console.error('Master introuvable : ' + SRC);
    process.exit(1);
  }

  const { chromium } = loadPlaywright();
  const browser = await chromium.launch();
  const page = await browser.newPage();

  const erreurs = [];
  page.on('pageerror', (e) => erreurs.push('pageerror: ' + e.message));
  page.on('requestfailed', (r) => erreurs.push('requete echouee: ' + r.url()));

  await page.goto('file://' + SRC, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);

  /* Un <img> casse ne fait pas echouer la navigation : Chromium l'imprime en
     cadre vide, sans un mot. On le verifie explicitement. */
  const images = await page.evaluate(() =>
    [...document.images].map((i) => ({ src: i.getAttribute('src'), ok: i.complete && i.naturalWidth > 0 })));
  const cassees = images.filter((i) => !i.ok);

  await page.pdf({
    path: OUT,
    printBackground: true,
    preferCSSPageSize: true,
    displayHeaderFooter: true,
    headerTemplate: '<span></span>',
    footerTemplate: footer,
    margin: { top: '19mm', right: '18mm', bottom: '17mm', left: '18mm' },
  });

  await browser.close();

  const ko = fs.statSync(OUT).size / 1024;
  console.log('PDF : ' + path.relative(ROOT, OUT) + '  ' + ko.toFixed(0) + ' Ko');
  console.log('Images : ' + (images.length - cassees.length) + ' / ' + images.length + ' chargees');
  if (cassees.length) {
    console.error('IMAGES CASSEES :');
    cassees.forEach((i) => console.error('  ' + i.src));
  }
  if (erreurs.length) {
    console.error('ANOMALIES :');
    erreurs.forEach((e) => console.error('  ' + e));
  }
  if (cassees.length || erreurs.length) process.exit(1);
})();
