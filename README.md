# Balinaisa — Simulateur d'extérieur IA

Front du simulateur de homestaging extérieur pour Balinaisa (mobilier teck), propulsé par Paktiz.
Ce repo ne contient que le **site statique** servi par GitHub Pages.

> **Backend & IP** (flow Activepieces, guide de déploiement, brief de l'agent IA) :
> repo privé [`balinaisa-assets`](https://github.com/charlusminus/balinaisa-assets).

## Structure

```
index.html     — page principale (wizard : Photo → Coordonnées → Confirmation)
styles.css     — design system
simulator.js   — logique UI + envoi du lead au webhook Activepieces
embed.js       — snippet à coller sur balinaisa.com
result.html    — page de rendu
```

## Déploiement GitHub Pages

1. Push sur `main`
2. Settings → Pages → Source : `main` / `/ (root)`
3. URL publique : `https://balinaisa.ai/`

## Intégration sur balinaisa.com (widget « Simuler avec Balinaisa.ai »)

`embed.js` est un **composant autonome** (styles scopés, aucune dépendance au CSS du site) :
bouton flottant qui ouvre le simulateur, avec UTM et tracking de clic. Prêt à déposer.

Coller avant `</body>` :

```html
<script src="https://simulateur.balinaisa.com/embed.js" defer></script>
```

Options (data-attributes sur la balise `<script>`) :
- `data-position="bottom-right"` (défaut) / `"bottom-left"`
- `data-label="Simuler avec Balinaisa.ai"`
- `data-target="https://simulateur.balinaisa.com/"` (URL du simulateur)
- `data-skip-intro="true"` (défaut) : arrive **directement sur l'import photo** (ajoute `?start=1`, saute l'écran d'accueil pour éviter le doublon quand on vient du site) ; `"false"` pour ouvrir l'accueil
- `data-utm-source` / `data-utm-medium` / `data-utm-campaign` (défauts : `site-balinaisa` / `widget-sticky` / `balinaisa-ai`)

Le simulateur reconnaît `?start=1` (ou `#simuler`) et démarre alors sur l'import photo.

**Tracking** : UTM ajoutés à l'URL + événement de clic poussé (si présents) à Google Analytics
(`gtag` / `dataLayer`) et Plausible. Aperçu/essai : `widget-demo.html`.
Testé aux breakpoints desktop / 375 / 320 px, `prefers-reduced-motion` et focus clavier.

## Fonctionnement

Le front capture (photo + coordonnées + profil particulier/pro) et POST le lead au
webhook Activepieces. Toute la suite (agent déco IA, sélection produits + devis,
génération d'image, Google Sheets, emails) vit dans le flow Activepieces → voir
[`balinaisa-assets`](https://github.com/charlusminus/balinaisa-assets).
