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
