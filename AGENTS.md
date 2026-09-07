# Front simulateur Balinaisa (dev)

Contexte technique pour travailler sur ce repo. **Public** : il ne contient que le front. Le backend, la config et le contexte projet vivent dans un **repo privé séparé** (`balinaisa-assets`) : s'y référer pour tout ce qui n'est pas le site.

## Ce repo
Site statique du simulateur d'extérieur Balinaisa, servi par **GitHub Pages** (`https://balinaisa.ai/`). Aucun build : HTML/CSS/JS purs.

```
index.html     wizard (Photo, Coordonnées, Confirmation)
styles.css     design system
simulator.js   logique UI + envoi du lead au webhook n8n
embed.js       snippet à coller sur balinaisa.com
result.html    page de rendu
```

## Déploiement
Push sur `main` = mise en ligne (Pages, source `main` / root). Les liens `styles.css` / `simulator.js` sont versionnés (`?v=...`) : bumper le numéro à chaque changement pour forcer le rechargement chez les visiteurs (évite le cache navigateur).

## i18n : la clé, c'est la phrase FR
`i18n.js` traduit en cherchant le **texte FR entier comme clé** du dico EN. Changer un texte FR dans un `.html` sans reporter le nouveau texte **à l'identique** en clé suffit à casser la traduction : `tr()` ne trouve plus rien et **renvoie le français aux anglophones, sans aucune erreur console**. C'est arrivé au `<title>` (PR #11).

Garde-fou : `node tools/check-i18n.js` liste les clés qui ne correspondent à aucun texte rendu. Il tourne en CI sur chaque PR. Les absences légitimes (catégories du catalogue, UI retirée) se déclarent dans `tools/i18n-allowlist.json`, raison obligatoire.

## `/en/` est généré, ne jamais l'éditer à la main
`node tools/build-en.js` fabrique les pages anglaises depuis les pages françaises et le dico. `build-en.js --check` échoue si le contenu de `/en/` ne correspond plus à ce que la génération produirait : c'est le second garde-fou de CI. Modifier un fichier sous `/en/` directement, c'est se faire écraser au build suivant.

Le générateur porte aussi `liensMorts()`, qui échoue le build quand une page générée pointe vers un fichier local absent. Il existe parce que `/en/index.html` a servi `i18n.js` et `simulator.js` en 404 pendant sept semaines, du 17/07 au 02/09 : le sélecteur de langue avait disparu et le CTA était inerte, sans la moindre erreur visible côté CI. Un test de non-régression ne couvrait pas cette classe de panne, seul un garde-fou générique la couvre.

## `/marque/` est une bibliothèque, pas la source des icônes
`/marque/` réunit les déclinaisons du logo et la page qui les présente, pour partage à des tiers. **Les icônes réellement servies** (`favicon.svg`, `favicon.png`, `apple-touch-icon.png`, les deux maskables, `site.webmanifest`) vivent **à la racine** et sont référencées par les pages. Modifier un fichier de `/marque/` ne change rien au site.

## Notes techniques
- Le front **POST le lead en `application/json`** au webhook n8n (voir `simulator.js`). Ne pas utiliser `mode:'no-cors'` : ça force `text/plain` et le backend ne parse plus le body.
- La photo est **redimensionnée côté client** (~1200px, JPEG 0.85) avant envoi.
- Tout le traitement du lead (composition, image, emails) se passe **hors de ce repo**, dans le flow n8n.

## Règles de marque & de code
- **Aucune clé / secret** dans ce repo (public).
- Pas de contexte business, tarifaire ou stratégique ici.
- **Zéro tiret cadratin** dans les contenus ; **zéro mention « IA »** : on parle de « Balinaisa.ai, l'œil de Dominique ».
- Changements **front** ici. Backend, docs, assets : repo privé `balinaisa-assets`.
