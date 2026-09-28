/* Balinaisa.ai redirige vers le site depuis la mise en ligne de balinaisa.com : le simulateur est
   devenu une page du site (balinaisa.com/simulateur/, /en/simulator/), decision de Charles du
   28/09/2026 (docs/SIMULATEUR.md du depot balinaisa-site). balinaisa.ai reste l'adresse
   commerciale, et ce script est le premier charge par l'accueil, /en/, la politique de
   confidentialite et la page 404 (etapes virtuelles /profil, /coordonnees...).

   GitHub Pages ne sait pas faire de 301 : location.replace, avant tout le reste (GTM compris,
   rien n'est mesure ici sans consentement), n'empile pas la page dans l'historique, et Google la
   traite comme une redirection.

   Attribution (contrat RUN, article 1) : les parametres suivent (UTM des campagnes et des liens
   deja diffuses, utm_source=partage, gclid, fbclid). Sans emplacement, le lead porte
   utm_content = balinaisa-ai dans Brevo : on sait qu'il est passe par l'adresse commerciale, sans
   inventer une Source hors de la liste fermee. start et lang ne servent plus. Restent servis
   ici : merci.html et result.html (liens des courriels n8n), /presse/ et /marque/. */
(function () {
  var SITE = 'https://balinaisa.com';
  var p = location.pathname;
  var en = p.indexOf('/en/') === 0;
  var cible = /privacy-policy/.test(p) ? (en ? '/en/privacy/' : '/confidentialite/') : (en ? '/en/simulator/' : '/simulateur/');
  var q = new URLSearchParams(location.search);
  q.delete('start');
  q.delete('lang');
  if (/simula/.test(cible) && !q.get('utm_content') && !q.get('depuis')) q.set('depuis', 'balinaisa-ai');
  var s = q.toString();
  location.replace(SITE + cible + (s ? '?' + s : ''));
})();
