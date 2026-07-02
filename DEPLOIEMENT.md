# Déploiement — Simulateur Balinaisa

## 1. Front (GitHub Pages)
`git push origin main` → mise en ligne automatique sur https://charlusminus.github.io/balinaisa-pz/

## 2. Google Sheets — écriture en 2 temps

Le flow écrit le lead **deux fois** pour ne jamais perdre la donnée si l'IA échoue :

1. **Phase 1** (`step_5`, `insert_row`) — à la soumission du form : capture immédiate du contact + `Statut = "Form reçu"`.
2. **Phase 2** (`step_8`, `update_row`) — après génération IA : met à jour **la même ligne** avec les produits recommandés, le devis et le lien de simulation, puis `Statut = "Simulation générée"`.
3. **Puis** les emails partent (`step_3` Balinaisa, `step_4` client).

### En-tête à mettre (ligne 1) — 16 colonnes A→P
```
Date | Heure | Profil | Entreprise | Prénom | Nom | Email | Téléphone | Horizon achat | Statut | Produits recommandés | Quantité | Total HT | TVA | Total TTC | Lien simulation
```
Colonnes K→P (Produits, Quantité, Total HT, TVA, Total TTC, Lien simulation) = sortie de l'IA, écrites en phase 2 et reprises dans les 2 emails. Les ~11 lignes existantes sont des tests : tu peux les vider (garde la ligne 1).

## 3. Activepieces (flow live)

Réimporte `Activepieces/Balinaisa — Simulateur Leads.json` sur cloud.activepieces.com puis republie.

Nouvelle chaîne :
```
trigger → step_1 (date) → step_2 (parse profil/contact)
        → step_5  insert_row   [PHASE 1 : contact, A–J]
        → step_7  (extrait le n° de ligne de l'insert)
        → step_6  IA (produits + devis + image)   ← placeholder pour l'instant
        → step_8  update_row   [PHASE 2 : reco IA, A–M, même ligne]
        → step_3  email Balinaisa
        → step_4  email client (image de simulation)
```

### ⚠️ À vérifier au 1er test live (spécifique à la piece Google Sheets)
- **`step_8.row_id`** est bindé sur `{{step_7['output']['row_number']}}`. `step_7` extrait le n° de ligne de la sortie d'`insert_row` (gère `row`, `rowId`, `rowNumber`, ou parse `updatedRange`). Si l'update vise la mauvaise ligne, regarde la sortie réelle de `step_5` dans le run et ajuste `step_7`.
- Si l'UI nomme le champ ligne autrement que `row_id` (selon version de la piece), re-mappe-le dans le builder.
- `step_8` ré-écrit **toutes** les colonnes A–M (contact + IA) pour éviter d'effacer le contact si l'`update_row` remplace la ligne entière.

### Résilience
- `step_5` (capture lead) : `continueOnFailure = false` (si on ne peut même pas sauver le lead, on veut le savoir).
- `step_6`, `step_7`, `step_8`, `step_3`, `step_4` : `continueOnFailure = true` → si l'IA ou l'update échoue, le lead reste sauvé en phase 1 et le run continue.

## 4. Agent déco IA (step_6) — « l'œil de Dominique »

Brief complet : `Agent-Decorateur-Balinaisa.md`.

`step_6` appelle désormais un **modèle vision Claude** qui : analyse la photo → sélectionne le mobilier Balinaisa dans le catalogue → calcule le devis (HT/TVA/TTC recalculés côté serveur) → renvoie une justification (`rationale`) et une **consigne d'image** (`image_prompt`) avec la contrainte « ne pas retoucher le reste du décor ». La photo (`photo_base64`, redimensionnée ~200-400 Ko) est de nouveau envoyée par le front et transmise via `step_2`.

### Pour activer (2 réglages)
1. **Clé API Anthropic** : dans le builder AP, ouvre `step_6` et renseigne l'input `anthropic_api_key` (stocké dans AP, **jamais** committé). Sans clé → `step_6` retombe sur le placeholder (le flow continue).
2. **Catalogue réel** : remplace le tableau `CATALOG` de `step_6` par le vrai catalogue Balinaisa + prix HT confirmés par Dominique (plusieurs références sont « sur devis »).

Modèle par défaut : `claude-opus-4-8` (input `model`, remplaçable par un Sonnet pour réduire le coût/lead).

## 5. Génération de l'image de simulation (step_9 + step_10)

- **step_9** — édite la photo avec **Gemini 2.5 Flash Image** (« Nano Banana ») : ajoute uniquement le mobilier Balinaisa (via `image_prompt` de step_6), garde le reste intact.
- **step_10** — héberge l'image générée (base64) sur **ImgBB** → URL publique, reprise en col. P du Sheet et dans le mail client.
- Fallbacks : si une clé manque ou qu'un appel échoue, on retombe sur l'image placeholder et le flow continue (lead + devis déjà sauvés).

### Pour activer (2 clés)
1. **`gemini_api_key`** dans `step_9` — clé Google AI Studio (https://aistudio.google.com/apikey, simple clé API, **pas** de projet GCP/Vertex). Modèle par défaut `gemini-2.5-flash-image` (input `model`).
2. **`imgbb_api_key`** dans `step_10` — clé gratuite sur https://api.imgbb.com/.

### Améliorer la fidélité produit (v2)
V1 est *prompt-only* : Gemini place du mobilier teck conforme à la description, pas les SKU exacts. Pour la fidélité de marque, passer aussi des **images de référence** des produits sélectionnés (Gemini 2.5 Flash Image accepte plusieurs images en entrée) → ajouter une URL photo par produit dans le `CATALOG` de step_6 et les joindre dans `contents.parts` de step_9. Limite connue : reproduire un SKU pixel-perfect reste au front de l'état de l'art ; viser une intégration crédible (proportions/matières/couleurs).

### Alternatives modèle (si besoin)
- **FLUX.1 Kontext** (via fal.ai / Replicate) : très bon en édition « garde le reste », sortie déjà hébergée (1 seule clé, remplace step_9 **et** step_10).
- **Vertex AI Imagen 3** : nécessite un projet GCP + service account (plus lourd).
