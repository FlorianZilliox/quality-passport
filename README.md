# Quality Passport · World Quality Week 2026

Web app statique qui remplace le passeport papier : un QR code par pilier, une question ouverte, une étoile par réponse, et un Quality Passport en PDF après les 4 étoiles. Programme : **Quality Powering Performance**.

- App en ligne : https://florianzilliox.github.io/quality-passport/
- Réponses : Google Sheet « Quality Report » (onglets `Responses` et `Stars`)

## Ce qu'il te reste à faire, dans l'ordre

### 1. Brancher le Google Sheet (10 min, une seule fois)

1. Ouvre le Sheet « Quality Report ».
2. Menu **Extensions > Apps Script**. Efface le contenu de `Code.gs` et colle le fichier [`apps-script/Code.gs`](apps-script/Code.gs) en entier. Enregistre (icône disquette).
3. Dans la liste des fonctions en haut, choisis **setup** puis **Exécuter**. Google demande une autorisation : choisis ton compte, puis **Paramètres avancés > Accéder au projet (non sécurisé)** > **Autoriser**. C'est normal pour un script personnel.
   Résultat : les onglets `Responses` et `Stars` apparaissent dans le Sheet.
4. **Déployer > Nouveau déploiement**. Type (roue dentée) : **Application Web**.
   - Exécuter en tant que : **Moi**
   - Qui peut accéder : **Tout le monde**

   Clique sur **Déployer** et copie l'**URL de l'application Web** (elle finit par `/exec`).
5. Envoie-moi cette URL, ou colle-la toi-même dans [`config.js`](config.js) à la ligne `SCRIPT_URL: ''` (entre les apostrophes), directement dans GitHub (icône crayon, puis **Commit changes**).

> Pour modifier le script plus tard : **Déployer > Gérer les déploiements > crayon > Version : Nouvelle version > Déployer**. L'URL reste la même. Ne crée jamais un « Nouveau déploiement », il changerait l'URL et les QR codes ne marcheraient plus.

### 2. Remplir les textes

Tout se modifie dans [`config.js`](config.js), le seul fichier à toucher :

- `question` de chaque pilier : aujourd'hui en lorem ipsum ;
- les textes de l'interface (`TEXT`) si vous voulez les ajuster.

Tant qu'il reste du lorem ipsum ou un `TODO`, ou si `SCRIPT_URL` est vide, un avertissement apparaît dans la console du navigateur (jamais à l'écran des participants).

### 3. Visuel du programme

Déjà en place : `assets/logo.png` (visuel complet, sur l'accueil) et `assets/logo-mark.png` (le « Q » recadré en carré, pour les médaillons ronds et le PDF). Pour changer de visuel, remplace ces deux fichiers en gardant leurs noms.

### 4. Tester sur ton téléphone

Scanne `qr/pillar-1.png` (ou affiche-le à l'écran), entre ton email, réponds. La réponse doit apparaître dans l'onglet `Responses` du Sheet en quelques secondes. L'onglet `Stars` montre les étoiles par personne ; le script le recalcule après chaque réponse (menu **Quality Passport > Rebuild Stars** pour le recalculer à la main).

## Les QR codes

Dans [`qr/`](qr/) : `pillar-1` à `pillar-4` (une question chacun) et `passport` (le passeport, pour l'accueil). Pour l'impression, chaque QR existe en **SVG** (vectoriel, net à toute taille : à donner à l'imprimeur) et en **PNG 4096 px** (environ 35 cm à 300 dpi). Garder une zone blanche autour du code et un format d'au moins 3 cm de côté. Ils pointent vers l'adresse GitHub Pages ci-dessus, qui ne changera pas : tu peux les imprimer dès maintenant, même si les questions changent ensuite.

## Comment ça marche

```
Téléphone (GitHub Pages)  --POST réponse-->  Apps Script  -->  Sheet « Responses »  -->  onglet « Stars » (formules)
                          <--GET étoiles---
```

- Au premier scan, le participant saisit son email pro une seule fois.
- L'étoile s'allume tout de suite ; l'envoi part en arrière-plan. Si le wifi tombe, la réponse attend dans le téléphone et repart automatiquement.
- Changement de navigateur (scanner intégré, autre téléphone) : les étoiles sont retrouvées grâce à l'email.
- Les piliers se découvrent au fur et à mesure : un pilier non scanné reste « To discover ».
- Une question ne s'ouvre qu'en scannant son QR code : l'app ne propose jamais de passer d'un pilier à l'autre.
- Après la 4ᵉ étoile : célébration « Walk of Fame », puis le Quality Passport en PDF (nom modifiable, accents gérés).

## Organisation du code

| Fichier | Rôle |
| --- | --- |
| `config.js` | **Seul fichier à modifier** : URL du script, piliers, questions, textes, couleurs |
| `index.html` | Structure des écrans |
| `css/` | `tokens.css` (charte Ipsen, police Rethink Sans), `base`, `components`, `screens`, `celebration` |
| `js/main.js` | Démarrage |
| `js/router.js` | Choix de l'écran selon l'URL (`?p=1` à `?p=4`) et l'état |
| `js/state.js` | État local du participant |
| `js/queue.js` | File d'attente d'envoi et restauration des étoiles |
| `js/backend/` | Apps Script réel, ou faux backend (mode simulé) |
| `js/screens/` | Un fichier par écran |
| `js/passport/` | Dessin du passeport et export PDF (jsPDF, cdnjs) |
| `apps-script/Code.gs` | Script Google à coller dans le Sheet |
| `qr/generate.mjs` | Génère et vérifie les QR codes |
| `tests/` | Tests automatiques |

Pas de framework, pas de compilation : les fichiers publiés sont ceux du dépôt.

## Pour un développeur

```bash
npm install
npx playwright install webkit chromium
npm run serve          # http://localhost:4173  (mode simulé tant que SCRIPT_URL est vide)
npm test               # tests du script Google + 8 scénarios Playwright (iPhone 13, Pixel 7)
npm run qr -- https://florianzilliox.github.io/quality-passport/
```

Mode simulé : quand `SCRIPT_URL` est vide, les réponses sont stockées dans le navigateur (clé `wqw_mock_sheet`). `?mockfail=1` fait échouer chaque envoi pour tester la file d'attente. L'app doit être servie en http (pas ouverte en double-cliquant `index.html`), car elle utilise des modules JavaScript.

Police : Rethink Sans, licence SIL Open Font License (`fonts/OFL.txt`).
