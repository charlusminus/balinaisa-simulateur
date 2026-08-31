# Médias de l'espace presse

Déposer ici les fichiers servis par `presse/index.html`, puis les déclarer dans le tableau
`MEDIAS` de cette page. Tant que le tableau est vide, la grille reste masquée et la page
propose l'envoi par email : elle ne montre jamais d'image cassée ni de bloc « à venir ».

## Ce qui manque aujourd'hui

- Les avant/après en haute définition.
- Le logo en PNG à fond transparent (le SVG est déjà servi depuis balinaisa.com).
- Le portrait de Dominique Raynal.

## Format attendu pour les avant/après

- JPEG, **2000 px minimum sur le grand côté**, qualité 85 environ.
- Nommage lisible et stable : `balinaisa-ai_avant-apres_terrasse_01.jpg`.
- Une légende par visuel, écrite dans le tableau `MEDIAS`, pas dans le nom du fichier.

## Deux vérifications avant de publier un avant/après

1. **Le rendu doit être brut**, tel que la chaîne le produit. La page l'affirme noir sur blanc.
   Si un visuel a été retouché, soit on le retire, soit on retire la phrase.
2. **La photo « avant » montre un lieu réel.** À ce jour, les photos de test viennent de
   l'entourage, pas de clients. Il faut l'accord de la personne concernée avant toute
   publication, et ne jamais laisser croire qu'il s'agit d'un chantier client si ce n'en est pas un.

## Ajouter un visuel

Dans `presse/index.html`, remplacer `var MEDIAS = [];` par :

```js
var MEDIAS = [
  { fichier: 'balinaisa-ai_avant-apres_terrasse_01.jpg', legende: 'Terrasse, avant et après. Rendu Balinaisa.ai, brut.' }
];
```
