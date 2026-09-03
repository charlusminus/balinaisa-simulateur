# Balinaisa, repères de marque · design system v0.4

Bibliothèque de marque, présentée sur une page :

**https://balinaisa.ai/marque/**

La page montre chaque déclinaison, la palette et les quatre polices en
spécimens, avec un lien de téléchargement par fichier. C'est l'adresse à
transmettre : elle s'ouvre sans compte ni permission.

`planche_reperes-de-marque_v0.4.png` reprend le tout sur une image, à joindre
à un message pour qui préfère une pièce jointe à un lien.

Ce README est la note technique. Les raisons des choix y sont détaillées ; la
page, elle, va à l'essentiel.

Toutes ces déclinaisons sont dérivées de deux fichiers source de la marque, le
monogramme carré et la signature horizontale, conservés au Drive dans
« images divers ». Aucun tracé n'a été redessiné.

## Palette

| rôle | valeur |
|---|---|
| doré (accent, mesuré sur balinaisa.com) | `#C3875E` |
| doré survol | `#A96E47` |
| encre | `#242424` |
| taupe | `#807869` |
| greige | `#9C9084` |
| sauge | `#959880` |
| sauge clair | `#D6D7CE` |
| sable | `#D9C19E` |
| sable clair | `#F0E4CC` |
| ivoire (fond) | `#FAF9F5` |
| ivoire 2 | `#F5F3EC` |
| blanc | `#FDFDFD` |

## Typographie

| rôle | police |
|---|---|
| titres | Cormorant Garamond, repli Georgia |
| textes longs | Lora, repli Georgia |
| capitales | Josefin Sans, chassées à 0.18em, repli Century Gothic |
| corps | Inter, repli system-ui |

Angles droits, aucun arrondi. Filet doré de 88 px pour ouvrir une section.

## Un point de cadrage à connaître

Le `viewBox` du fichier source est **carré** (`-65 -138 2217 2217`) alors que le
tracé du monogramme est un **rectangle de rapport 1.509** (1911.9 x 1267.4)
posé de travers dedans. Cadrer sur le `viewBox` décentre la marque. Toutes les
déclinaisons ci-dessous sont cadrées sur la boîte réelle du tracé, relevée au
navigateur par `getBBox()`.

## Le monogramme

| fichier | usage |
|---|---|
| `monogramme_carre_ivoire-sur-teck` | icône d'application et favicon. C'est la déclinaison en production. |
| `monogramme_carre_encre-sur-ivoire` | variante claire, pour un support où le doré jure. Voir la réserve ci-dessous. |
| `monogramme_maskable_ivoire-sur-teck` | Android. Tracé à 62 % de large, demi-diagonale 0.372 sous la limite de 0.400 de la zone sûre : recadrage en cercle ou en squircle sans rognage. |
| `monogramme_libre_encre_transparent` | tracé seul, sur fond clair maîtrisé. |
| `monogramme_libre_ivoire_transparent` | tracé seul, sur fond sombre ou photo. |

**Réserve sur la variante claire.** Elle est fidèle à la charte mais ne tient
pas en petite taille. Mesuré : à 16 px, l'encre sur ivoire ne laisse que
2 pixels nettement sombres sur 256, le plus foncé à peine à 126/255 du blanc.
Le tracé disparaît dans une barre d'onglets claire. Ne pas l'employer sous
32 px. C'est la raison pour laquelle la production utilise la version reversée.

## La signature

| fichier | usage |
|---|---|
| `signature_plaque-ivoire` | en-tête d'email. La plaque ivoire est **dans l'image**, sans canal alpha, ce qui la rend immune au mode sombre : un client de messagerie inverse les couleurs d'un email mais jamais une image. Sans elle, l'encre noire se retrouvait sur un fond devenu noir, à 1.29:1. |
| `signature_encre_transparent` | signature seule, sur fond clair maîtrisé. |

## Formats

Les SVG sont la référence, ils se redimensionnent sans perte. Les PNG font
1024 px de large pour les monogrammes et 1446 px pour les signatures, ce qui
couvre l'écran comme l'impression courante.

Les icônes effectivement servies par le site (favicon, apple-touch-icon, icônes
maskables) vivent à la RACINE du dépôt, pas ici : elles sont référencées par les
pages et versionnées avec elles. Ce dossier est la bibliothèque de marque, à
partager. Modifier un fichier ici ne change rien au site.
