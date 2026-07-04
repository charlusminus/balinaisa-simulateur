# Front simulateur Balinaisa (dev)

Contexte technique pour travailler sur ce repo. **Public** : il ne contient que le front. Le backend, la config et le contexte projet vivent dans un **repo privé séparé** (`balinaisa-assets`) : s'y référer pour tout ce qui n'est pas le site.

## Ce repo
Site statique du simulateur d'extérieur Balinaisa, servi par **GitHub Pages** (`https://charlusminus.github.io/balinaisa-simulateur/`). Aucun build : HTML/CSS/JS purs.

```
index.html     wizard (Photo, Coordonnées, Confirmation)
styles.css     design system
simulator.js   logique UI + envoi du lead au webhook n8n
embed.js       snippet à coller sur balinaisa.com
result.html    page de rendu
```

## Déploiement
Push sur `main` = mise en ligne (Pages, source `main` / root). Les liens `styles.css` / `simulator.js` sont versionnés (`?v=...`) : bumper le numéro à chaque changement pour forcer le rechargement chez les visiteurs (évite le cache navigateur).

## Notes techniques
- Le front **POST le lead en `application/json`** au webhook n8n (voir `simulator.js`). Ne pas utiliser `mode:'no-cors'` : ça force `text/plain` et le backend ne parse plus le body.
- La photo est **redimensionnée côté client** (~1200px, JPEG 0.85) avant envoi.
- Tout le traitement du lead (composition, image, emails) se passe **hors de ce repo**, dans le flow n8n.

## Règles de marque & de code
- **Aucune clé / secret** dans ce repo (public).
- Pas de contexte business, tarifaire ou stratégique ici.
- **Zéro tiret cadratin** dans les contenus ; **zéro mention « IA »** : on parle de « Domia, l'œil de Dominique ».
- Changements **front** ici. Backend, docs, assets : repo privé `balinaisa-assets`.
