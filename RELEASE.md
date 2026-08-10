# Process de release, simulateur Balinaisa (front public)

Ce repo (`balinaisa-simulateur`) est **public** et déployé automatiquement sur
GitHub Pages : **tout `push` sur `main` met le site en prod**, immédiatement
visible par les prospects (cf `.github/workflows/deploy-pages.yml`). On applique
donc un process de rollout, pas de commit direct sur `main`.

## Règle d'or
**Jamais de commit ni de push direct sur `main`.** Toute modif passe par une
branche dédiée puis une Pull Request. La branche `main` est protégée (PR requise).

## Flow

1. **Branche dédiée** depuis `main` à jour :
   ```
   git checkout main && git pull --ff-only
   git checkout -b feat/ma-modif      # ou fix/... , docs/...
   ```

2. **Vérification locale** (avant même d'ouvrir la PR), servir le site en local et contrôler :
   - [ ] Console navigateur propre, aucune erreur réseau
   - [ ] Le **POST du lead** atteint bien le webhook n8n (test avec un marqueur, sans polluer les vrais leads)
   - [ ] **i18n FR/EN** : toggle manuel + détection navigateur (`?lang=en`), pas de flash de texte non traduit
   - [ ] **Responsive** mobile + desktop
   - [ ] Si des assets ont changé (JS/CSS/images) : **bump du cache-bust** `?v=AAAAMMJJx` dans `index.html` et `merci.html` (sinon les visiteurs récurrents gardent l'ancienne version en cache)

3. **Push de la branche + PR** :
   ```
   git push -u origin feat/ma-modif
   gh pr create --fill
   ```
   La PR sert de revue (diff) et de trace. Attendre le feu vert avant merge.

4. **Merge sur `main`** → l'Action `Deploy to GitHub Pages` déploie. Vérifier que le run passe au **vert** (Actions).

5. **Smoke test en prod** sur https://balinaisa.ai/ :
   - [ ] La page charge, le wizard s'ouvre
   - [ ] Switch de langue OK
   - [ ] Une **simulation de test** de bout en bout : le lead atterrit dans le Sheet et l'email part

6. **Contrôle des commits orphelins** :
   ```
   node tools/check-orphans.js
   ```
   - [ ] Aucun orphelin, ou chaque orphelin est rebranché sur une PR

## Commits orphelins : le piège qui a mordu deux fois

**Un commit poussé sur une branche dont la PR est DÉJÀ mergée n'arrive jamais dans `main`.** La PR est close, elle ne reprend pas les commits suivants. Rien ne le signale : `git status` reste propre, aucune PR n'apparaît ouverte, et le travail semble fait.

Ça s'est produit **deux fois sur ce repo**, et les deux fois le travail a été annoncé comme livré :

| Date | Incident | Découvert |
|---|---|---|
| 27/07 | PR #21 mergée à 19h38, commit `e16ae50` poussé à 19h50. Portait la simplification des UTM des liens sortants | **2 semaines plus tard** (PR #28) |
| 29/07 | PR #24 mergée, commit schema.org poussé après | le jour même (PR #25) |

**Pourquoi une relecture de `git log` ne suffit pas.** Le merge se fait en squash : les sha d'origine disparaissent. Du coup `git branch --merged` croit la branche non fusionnée, **et** `git log main..branche` liste des commits dont le contenu est pourtant déjà dans `main`. Les deux signaux sont trompeurs, dans des sens opposés.

`tools/check-orphans.js` compare les **patches** et non les sha (via `git cherry`), sur les branches locales **et distantes**, puis croise avec l'état de la PR :

- `ORPHELIN` (PR mergée ou fermée) → ces commits n'arriveront jamais, il faut les rebrancher :
  ```
  git checkout -b fix/<slug> origin/main && git cherry-pick <sha>
  ```
- `PR ouverte` → normal, travail en cours.
- `aucune PR` → branche de travail, à proposer ou à supprimer.

**Réflexe à garder** : après un merge, si tu t'apprêtes à pousser « juste un petit ajout » sur la même branche, **ouvre une nouvelle branche**. C'est exactement le moment où ça casse.

## Rollback

En cas de régression en prod, revenir à l'état précédent :
```
git revert -m 1 <sha-du-merge>   # ou git revert <sha>
git push origin main             # redéploie l'état précédent (concurrency: le dernier push gagne)
```
Le déploiement est idempotent et rapide ; un revert redéploie la version d'avant
en une passe. Alternative : relancer un déploiement depuis un `main` sain via
`workflow_dispatch` sur l'Action.

## Notes
- **Pas de staging en ligne natif** : Pages ne sert que `main`. La branche + la
  vérif locale (preview) tiennent lieu de pré-prod. Si un vrai preview par branche
  devient utile, envisager un déploiement type Cloudflare/Netlify Pages (deploy previews).
- **Jamais** de contenu business/pricing/clé dans ce repo (il est public). Ces
  éléments vivent dans le repo privé `balinaisa-assets` et dans les credentials n8n.
- Branch protection posée sur `main` : PR requise, pas de force-push ni de
  suppression de branche. L'admin garde une échappatoire pour un revert d'urgence.
