# Médias de l'espace presse

Fichiers servis par `presse/index.html`. La page est le communiqué lui-même, mot pour
mot celui du PDF, et les visuels sont placés dans le fil du texte, à l'endroit exact où
ils l'illustrent. Ils ne sont plus pilotés par un tableau JavaScript : chaque paire est
écrite en dur dans la page, à sa place dans le récit.

## Ce qu'il y a aujourd'hui

Trois paires avant / après, issues de simulations réelles de fin juillet 2026 :

| paire | lead | photo d'origine | rendu |
|---|---|---|---|
| terrasse couverte | `2026-07-27T19:27:46.330Z-52200` | 1200 x 1600 | 896 x 1200 |
| salle à manger | `2026-07-27T20:27:25.146Z-364109` | 1512 x 2016 | 896 x 1200 |
| terrasse de café | `2026-07-28T09:51:26.998Z-587437` | 1536 x 2048 | 896 x 1200 |

Les rendus viennent du dossier Drive des simulations, en qualité d'origine, pas des
copies WhatsApp qui circulaient. Les photos « avant » de ces trois leads n'ont jamais
été déposées sur Drive par le pipeline (le dépôt automatique de la photo du prospect
n'a commencé que le 28/07 à 18h09) : elles ont été récupérées auprès de Charles.

**Accords obtenus** avant publication : Marine Imbert, amie de Dom, pour la terrasse
couverte, et le gérant pour la terrasse de café, qui est identifiable (place Royale à
Nantes). La salle à manger est le domicile de Charles.

S'y ajoutent deux fichiers hors paires :

- `balinaisa-ai_devis_salle-a-manger-01.jpg`, la capture du **vrai devis** reçu par email
  pour la simulation de la salle à manger. Extraite du HTML de l'email de l'exécution 497
  et rendue à 3x, ce n'est pas une maquette.
- `balinaisa-ai_portrait-dominique-raynal.jpg`, extrait du communiqué d'origine.

## Ce qui manque encore

- Le logo en PNG à fond transparent (le SVG est déjà servi depuis balinaisa.com).
- **Le portrait de Dominique Raynal en haute définition.** Celui qui est servi fait
  253 x 210 pixels, tiré du PDF du communiqué d'origine faute de mieux. Ça passe à la
  taille où la page l'affiche, c'est très insuffisant pour qu'une rédaction le publie.

## Format

- **Fichier pleine taille** dans ce dossier : qualité et définition d'origine, jamais
  recompressé. C'est ce que télécharge une rédaction.
- **Aperçu** dans `apercu/`, **560 px de large, qualité 78**, même nom de fichier.
  C'est ce que la page affiche. Sans lui, la page pèserait 3,2 Mo à l'ouverture pour
  des visiteurs qui, pour la plupart, ne téléchargeront rien.
- Nommage stable et lisible : `balinaisa-ai_<avant|apres>_<lieu>-<NN>.jpg`.
- La légende vit dans le tableau `MEDIAS`, jamais dans le nom du fichier.

## Deux vérifications avant de publier une nouvelle paire

1. **Le rendu doit être brut**, tel que la chaîne le produit. La page l'affirme noir sur
   blanc. Si un visuel a été retouché, soit on le retire, soit on retire la phrase.
2. **La photo « avant » montre un lieu réel**, donc il faut l'accord de la personne ou
   de l'établissement concerné, et ne jamais laisser croire qu'il s'agit d'un chantier
   client si ce n'en est pas un.

## Ajouter une paire

Déposer les deux fichiers ici, générer leurs aperçus, puis insérer le bloc dans
`presse/index.html` à l'endroit du texte qu'il illustre :

```html
<figure class="media">
  <div class="pair">
    <a class="shot" href="medias/balinaisa-ai_avant_x-01.jpg" download><img src="medias/apercu/balinaisa-ai_avant_x-01.jpg" alt="..." loading="lazy"><span class="tag">Avant</span></a>
    <a class="shot" href="medias/balinaisa-ai_apres_x-01.jpg" download><img src="medias/apercu/balinaisa-ai_apres_x-01.jpg" alt="..." loading="lazy"><span class="tag after">Après</span></a>
  </div>
  <figcaption><b>Titre.</b> Ce que montre la scène, et ce qui a été conservé du bâti.<span class="dl">Cliquez sur une image pour la télécharger en pleine définition.</span></figcaption>
</figure>
```

**Le PDF du communiqué doit suivre.** Les deux supports racontent la même chose, dans le
même ordre : intérieur, extérieur privé, usage professionnel.
