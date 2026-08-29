# Audit SEO — warattah.com

Auditeur : agent `seo`. Méthode : lecture directe du code source du dépôt
(`Read`/`Grep`/`Glob`) uniquement — aucun accès Bash/WebFetch/WebSearch
disponible pour cette tâche. Aucune donnée Search Console, PageSpeed
Insights, log serveur ou vérificateur de backlinks n'a pu être consultée :
tout ce qui relèverait de ces sources est signalé explicitement comme
**incertitude / à vérifier**, jamais inventé.

Niveau de preuve global de ce document : **lecture de code = preuve
directe pour "ce que le site fait"**, mais **hypothèse/inférence pour "ce
que Google en fait réellement"** tant qu'aucune donnée Search Console
n'existe pour ce domaine tout juste connecté.

---

## 1. Diagnostic technique

### 1.1 SPA + `HashRouter` : le vrai problème n'est pas le rendu JS, c'est l'URL

**Preuve** — `src/main.jsx:3,11` : le routeur utilisé est `HashRouter`
(react-router-dom), pas `BrowserRouter`. `src/App.jsx:13-16` : deux routes
déclarées, `/` (Home) et `/contact` (Contact).

**Fait établi (certain, indépendant de toute capacité de rendu de
Google)** : un fragment d'URL (tout ce qui suit `#`) n'est, par
définition du protocole HTTP/de la RFC 3986, **jamais transmis au
serveur** dans la requête. `https://warattah.com/#/contact` et
`https://warattah.com/` déclenchent exactement la même requête HTTP et
reçoivent exactement la même réponse serveur (`index.html`). Ce n'est pas
une limitation de capacité de crawl/rendu JS de Google (le Googlebot
évergreen, qui exécute du Chromium récent depuis 2019, sait exécuter du
JavaScript côté client) — c'est une propriété du protocole que même un
crawler au rendu JS parfait ne peut pas contourner, puisque le fragment
n'existe tout simplement pas dans ce qui part vers le serveur ou vers
l'index d'URLs d'un moteur de recherche.

C'est d'ailleurs précisément pour cette raison que Google a déprécié en
2015 son ancien "schéma de crawl AJAX" (`#!`) et recommande depuis
l'API History (`pushState`, donc `BrowserRouter`) pour toute route qui
doit être indexable séparément — recommandation qui n'a jamais été
retirée depuis, car elle découle de la sémantique des URLs, pas d'une
limitation de rendu qui se serait résorbée avec le temps.

**Conséquence (fortement probable, pas vérifiée en Search Console faute
de données sur ce domaine)** : Google ne peut structurellement découvrir
et indexer qu'**une seule URL** pour tout le site,
`https://warattah.com/`. La page Contact (`src/pages/Contact.jsx`) n'a
aucune existence en tant qu'URL distincte pour un moteur de recherche —
elle ne peut donc jamais apparaître comme résultat propre (title/snippet
dédié) dans les résultats de recherche, indépendamment de la qualité de
son contenu.

C'est le constat technique le plus structurant de cet audit : tant que
l'architecture de routage n'exposera pas des URLs réelles par route
(`/contact` sans `#`), aucune optimisation on-page sur la page Contact
(title, description, hreflang) n'aura d'effet mesurable sur son
indexation.

### 1.2 Rendu client (CSR) et contenu dépendant d'un fetch tiers asynchrone

**Preuve** — `index.html:21-23` : le HTML servi ne contient que
`<div id="root"></div>` et un `<script type="module" src="/src/main.jsx">`
— aucun texte (titre H1, bio, tracklist) n'existe dans le HTML brut,
tout est injecté par React après exécution du JS.

Le Googlebot évergreen sait rendre le JS (fait documenté, pas une crainte
datée de 2015), mais ce rendu se fait dans une seconde vague de crawl
(Web Rendering Service), avec un délai non garanti et non publié par
Google — plus rapide qu'il y a quelques années selon la documentation
publique, mais sans SLA connu. **Incertitude explicite** : impossible de
mesurer ce délai réel pour ce domaine sans accès à Search Console.

Point spécifique à ce site — `src/i18n/I18nContext.jsx:16-23,30-47` et
`src/i18n/context.js:4-9` : le texte visible (`t.hero.*`, `t.bio.*`, etc.)
dépend d'un `fetch('https://ipapi.co/json/')` asynchrone déclenché après
montage, dont le résultat détermine la langue. Observations sur le code :
- `DEFAULT_LANG = 'en'` (`context.js:4`) est la valeur de langue au tout
  premier rendu (avant résolution du fetch), donc le contenu visible **au
  premier paint est toujours en anglais**, quel que soit le pays détecté
  ensuite.
- Le cache de langue est en `sessionStorage` (`I18nContext.jsx:18-19,39`)
  — sans valeur pour un crawler sans état persistant entre visites.
- Si le fetch vers `ipapi.co` échoue, est bloqué, ou n'a pas le temps de
  répondre pendant la fenêtre de rendu du Web Rendering Service de
  Google, le contenu capturé reste la valeur par défaut anglaise
  (`I18nContext.jsx:46` en cas d'échec explicite ; sinon simplement le
  rendu initial déjà en anglais avant résolution).
- **Hypothèse fortement probable, non vérifiable ici** : Google indexera
  très probablement le contenu en anglais pour `warattah.com/`, quelle
  que soit la langue prépondérante du public réel visé, à cause de ce
  mécanisme de détection par géolocalisation d'IP côté client plutôt que
  par URL.

Ce point n'est pas du ressort de `front` seul à corriger unilatéralement
— c'est une conséquence directe d'un choix d'architecture (pas de
segmentation d'URL par langue) qui a des implications SEO qu'il faut
trancher consciemment (voir section 4).

### 1.3 Absence de `robots.txt` et `sitemap.xml`

**Preuve** — `Glob public/**/*` : contenu de `public/` = `icons.svg`,
`favicon.svg`, `audio/breath.mp3`, `audio/the-urge.mp3`, `CNAME`. Aucun
`robots.txt`, aucun `sitemap.xml`.

- Absence de `robots.txt` : non bloquant en soi (`ROBOTS.TXT ≠
  GARANTIE D'INDEXATION`, absence de fichier = Google explore par défaut)
  mais aucune signalisation du sitemap, aucun contrôle explicite sur un
  futur crawl.
- Absence de `sitemap.xml` : `SITEMAP ≠ GARANTIE D'INDEXATION` — et vu le
  constat 1.1 (une seule URL réellement crawlable aujourd'hui), la valeur
  immédiate d'un sitemap est faible : il ne peut pas faire apparaître
  `/contact` comme URL indexable tant que le routage reste en `#`. Reste
  recommandé pour l'hygiène et pour anticiper une future architecture
  d'URLs multiples.

### 1.4 Title / meta description statiques, non localisés, uniques pour tout le site

**Preuve** — `index.html:9-13` :
```html
<meta name="description" content="Warattah — metal tribal. Musique brute, racines profondes." />
<title>Warattah</title>
```
Un seul title, une seule description, en français, statiques dans le
HTML — et comme constaté en 1.1, c'est **le seul title/description que
Google verra jamais pour l'ensemble du site**, Home et Contact compris,
puisqu'il n'y a qu'une URL crawlable.

- `<title>Warattah</title>` est très court, sans qualificatif utile à
  l'intention de recherche (pas de "metal tribal", "Nouvelle-Calédonie",
  etc. — voir section 2).
- Aucun mécanisme dans le code (pas de `react-helmet-async` en dépendance
  — vérifié dans `package.json:12-27`, absent — ni d'effet manuel
  `document.title = ...`) ne permet aujourd'hui de faire varier le title
  par route ou par langue détectée.

### 1.5 `hreflang` absent — et structurellement bloqué, pas juste oublié

**Preuve** — recherche `hreflang` sur `index.html` et `src/` : aucune
occurrence.

Le `hreflang` ne se pose que sur des **URLs distinctes par langue**. Ici,
la langue est choisie côté client par géolocalisation IP
(`I18nContext.jsx:9-13`), avec une seule et même URL pour les trois
langues. Ajouter du `hreflang` aujourd'hui n'aurait aucun sens technique
— ce n'est pas une case à cocher isolée, c'est dépendant d'une décision
d'architecture d'URL (voir section 4, dépendance explicite avec 1.1).

### 1.6 Structure des headings (`h1`/`h2`/`h3`)

**Preuve** — `src/pages/Home.jsx` :
- `h1` ligne 48-50 : contient uniquement une `<img src={warattahWordmark}
  alt="Warattah" />` — aucun texte visible/indexable directement dans le
  `h1`, seul le `alt` sert de nom accessible. Contenu correct mais très
  mince ("Warattah" seul, sans qualificatif).
- `h2` lignes 57, 64, 84 : `t.sections.titres` ("Titres"), `t.sections.clips`
  ("Clips"), `t.sections.groupe` ("Le groupe") — usage sémantique correct,
  pas de saut de niveau.
- `h3` lignes 103, 120 : titres des cartes démo/album (`t.bio.demoTitle`,
  `t.bio.albumTitle`). `src/components/VideoEmbed.jsx:29` : `h3` pour le
  titre de chaque clip. Hiérarchie `h1 > h2 > h3` cohérente, pas de saut
  détecté.

**Preuve** — `src/pages/Contact.jsx:18` : `h1` = `t.contact.title`
("Contact"), un seul mot, sans texte descriptif reliant la page au
groupe. Point mineur en soi, mais rappelé sans effet réel tant que 1.1
n'est pas résolu (cette page n'a pas d'URL indexable séparée).

### 1.7 Attributs `alt`

**Preuve** — `src/pages/Home.jsx:49,93,98,115` : toutes les images ont un
`alt` renseigné (pas d'`alt` manquant détecté sur les images de contenu).
Mais :
- Les `alt` des pochettes (lignes 93, 98, 115 — "Pochette de la démo
  Distorsion, 1er pressage", etc.) sont des **chaînes françaises codées en
  dur**, pas passées par `t.*` comme le reste du texte — incohérence avec
  le système i18n : un visiteur/crawler en contexte anglais ou espagnol
  reçoit un `alt` en français.
- `src/components/Header.jsx:16` : logo décoratif avec `alt=""` —
  correct (image purement décorative). `Header.jsx:17` : wordmark avec
  `alt="Warattah"` — correct.
- `src/components/VideoEmbed.jsx:21-23` : la vignette YouTube est posée en
  `background-image` CSS sur un `<button>`, pas en balise `<img>` — donc
  sans `alt` du tout (ce n'est techniquement pas une image content pour un
  crawler texte/image). L'action du bouton reste accessible via
  `aria-label` (ligne 20, `t.video.play(title)`). Impact SEO réel faible
  (perte d'opportunité Google Images sur la vignette, pas un blocage),
  mais à noter.
- `src/components/FlecheFaitiere.jsx:3` : SVG décoratif avec
  `role="presentation" aria-hidden="true"` — correctement masqué, aucun
  problème.

### 1.8 Open Graph / Twitter Card — absents

**Preuve** — recherche `og:`/`twitter:` sur `index.html` et `src/` :
aucune occurrence.

Point à souligner explicitement car souvent mal compris : les tags Open
Graph doivent être présents **dans le HTML brut servi**, pas seulement
dans le DOM rendu après JS — les crawlers de partage social (Facebook,
WhatsApp, Discord, etc.) n'exécutent généralement pas le JavaScript de la
page comme le fait Googlebot. Comme `index.html` ne contient aujourd'hui
aucun de ces tags de façon statique, tout partage de lien du site sur ces
plateformes affichera un aperçu vide ou générique — pertinent pour un
groupe de musique dont la promotion passe largement par le partage
social.

### 1.9 Données structurées `schema.org` (`MusicGroup`) — absentes

**Preuve** — recherche `application/ld+json`/`schema.org` sur tout le
dépôt : aucune occurrence. Aucun balisage structuré n'existe aujourd'hui.
Un bloc `MusicGroup` (nom, genre, `foundingDate`, `sameAs` vers Bandcamp,
etc.) aiderait à la désambiguïsation d'entité pour un nom de groupe non
unique, mais **`MARKUP VALIDE ≠ GARANTIE DE RÉSULTAT ENRICHI`** — à
présenter comme une opportunité, jamais comme un résultat garanti.

### 1.10 Point additionnel trouvé en cours d'audit : `<html lang="fr">` figé

**Preuve** — `index.html:2` : `<html lang="fr">` codé en dur. Recherche
`documentElement` dans `src/` : aucune occurrence — rien dans
`I18nContext.jsx` ne met à jour cet attribut quand la langue résolue est
`en` ou `es`. Résultat : un visiteur (ou un crawler) qui reçoit le
contenu anglais ou espagnol se voit servir un document dont l'attribut
`lang` annonce toujours le français — signal de langue contradictoire
pour les moteurs et les technologies d'assistance.

### Hors périmètre de ce diagnostic technique (nécessite un outil externe)

- Statut d'indexation réel (Search Console) : **inconnu**, domaine trop
  récent, aucune donnée disponible.
- Rendu effectif capturé par le Web Rendering Service de Google (outil
  "Inspection d'URL" de Search Console) : **non vérifiable ici**.
- Configuration DNS/Cloudflare réelle (mode proxy, éventuel Bot Fight
  Mode ou règle WAF qui bloquerait Googlebot, présence ou non d'un
  `www.warattah.com` en doublon non canonicalisé) : **non vérifiable
  sans accès DNS/Cloudflare** — point à faire vérifier par `devops`.
- Core Web Vitals (LCP/INP/CLS terrain) : hors mandat (`front` les
  possède déjà) et de toute façon non mesurable sans PageSpeed
  Insights/CrUX, outils indisponibles ici.

---

## 2. Diagnostic éditorial

**Preuve** — `src/i18n/translations.js:1-91`, contenu FR/EN/ES complet.

### Pertinence face à l'intention de recherche probable

Une requête plausible comme "warattah metal tribal nouvelle calédonie"
combine une recherche de marque (le nom du groupe, faible ambiguïté) et
une recherche d'attributs (genre musical, origine géographique). Le
contenu de bio couvre bien la matière factuelle utile à cette intention :
genre ("Metal brut et instinctif" / "Metal tribal", `translations.js:5,10`),
localisation (Nouméa, "aux portes de l'Australie", `translations.js:20`),
histoire (démo 2006, album 2012 chez XIIIbis/Warner, tournées avec Gojira
et Strapping Young Lad, `translations.js:10-21`). C'est un contenu
factuel solide pour de la recherche de marque.

**Limite constatée** : ce contenu n'existe qu'au sein du rendu JS d'une
seule page potentiellement indexable (section 1.1/1.4) et n'est reflété
nulle part dans le `title`/la `description` statiques (toujours
"Warattah — metal tribal. Musique brute, racines profondes.",
`index.html:9-13`) qui ne mentionnent ni la Nouvelle-Calédonie, ni Nouméa,
ni les repères factuels (Gojira, Warner, 2006) qui pourraient améliorer
la correspondance à des requêtes informationnelles plus larges
("groupe metal Nouvelle-Calédonie", "metal tribal calédonien").

### Qualité du texte de bio déjà en place

Le texte est narratif, factuel, sourcé sur des jalons vérifiables
(labels, dates, tournées) plutôt que sur des superlatifs marketing vides
— c'est un signal de qualité éditoriale positif au sens E-E-A-T
(expérience/expertise réelle démontrée par les faits, pas une déclaration
d'autorité non étayée). Pas de bourrage de mots-clés détecté. Longueur
correcte pour une page "À propos" de groupe (6 paragraphes, `p1` à `p6`).

### Cohérence FR/EN/ES

Les trois versions (`translations.js:2-30` FR, `32-60` EN, `62-90` ES)
sont des traductions fidèles et cohérentes entre elles sur le fond
(mêmes faits, mêmes noms propres conservés). Deux limites mineures déjà
signalées en section 1 : les `alt` d'images de pochettes restent
hardcodés en français quelle que soit la langue résolue
(`Home.jsx:93,98,115`), et le `title`/la `description` HTML ne sont
disponibles qu'en français statique (`index.html:9-13`) — incohérence
entre un corps de page traduit et un habillage de page (title, meta,
alt de certaines images) qui ne l'est pas.

---

## 3. Diagnostic d'autorité

**Preuve** — `src/pages/Contact.jsx:3-10` : seuls deux liens sortants
existent aujourd'hui — Email (`mailto:warattah@mailo.com`) et Bandcamp
(`https://warattah.bandcamp.com/music`). Contexte donné : Facebook,
ReverbNation, SoundCloud ont été retirés récemment sur demande de
l'utilisateur, comptes non accessibles actuellement.

### Constat

- Aucune présence sociale active linkée depuis le site actuellement.
- Domaine tout juste connecté (bascule DNS très récente) : aucun
  historique d'autorité, aucune donnée de backlinks vérifiable sans outil
  externe (Ahrefs/Majestic/Search Console "Liens" — indisponibles ici).
  **Incertitude explicite** : je ne peux affirmer ni infirmer l'existence
  de backlinks entrants existants (ex. presse spécialisée ayant couvert
  la démo de 2006 ou l'album de 2012, mentionné dans la bio elle-même,
  `translations.js:10,14`) — seul un outil de recherche de backlinks ou
  Search Console pourrait le confirmer.

### Niveau d'effort recommandé

Le contexte (site de groupe de musique tout juste lancé, domaine sans
historique, présence sociale volontairement réduite à deux liens
sortants) n'appelle **pas** une stratégie de netlinking active
(outreach, guest posts, échanges de liens, digital PR structuré) —
disproportionné pour l'enjeu et le stade actuel, et risque de dériver
vers des pratiques non légitimes (achat de liens, réseaux artificiels)
que je refuserais de toute façon de recommander.

Les leviers d'autorité pertinents à ce stade sont plus modestes et
factuels, pas des tactiques de manipulation :
- Cohérence d'entité (schema.org `MusicGroup` avec `sameAs` vers
  Bandcamp — section 1.9) pour aider un moteur à relier les points déjà
  existants (Bandcamp, presse historique mentionnée dans la bio) au
  domaine `warattah.com`, plutôt que d'essayer d'en fabriquer de
  nouveaux.
- Si le groupe a effectivement été couvert par la presse spécialisée en
  2006/2012 comme l'indique la bio, il peut exister des mentions/liens
  historiques déjà en place ailleurs sur le web (magazines metal,
  archives XIIIbis/Warner) — **hypothèse non vérifiée ici**, à confirmer
  via Search Console (rapport "Liens") une fois que des données seront
  disponibles pour le domaine, pas une action à entreprendre maintenant.
- Réactiver une présence sociale (Bandcamp déjà linké) reste une décision
  éditoriale/marketing du groupe, pas une recommandation SEO à imposer —
  hors mandat de cet audit.

**Confiance** : faible confiance sur tout constat d'autorité au-delà de
ce qui est visible dans le code — le domaine est trop récent et aucune
donnée externe n'est disponible pour ce cycle.

---

## 4. Contrat d'implémentation priorisé

Actions ordonnées par impact/effort. Chaque action a un critère de
vérification concret (`DONE SI`), à valider indépendamment par moi une
fois implémentée — jamais sur la seule parole de l'agent
d'implémentation. Les actions marquées **[coordination requise]**
dépassent le mandat de `front` seul et nécessitent un arbitrage
`architecte`/`devops` avant exécution, conformément aux frontières du
rôle SEO (je ne décide pas seul d'une architecture de rendu ou
d'infrastructure).

### P0 — Bloquant structurel

**1. Décider du sort du routage par fragment (`HashRouter`) — [coordination requise : `architecte` + `front` + `devops`]**

Constat : tant que les routes restent en `/#/...`, `/contact` ne peut
jamais devenir une URL indexable séparément (section 1.1). Deux
alternatives réelles à trancher, pas une seule solution imposée :
- (a) Migrer vers `BrowserRouter` (API History), ce qui exige côté
  hébergement (GitHub Pages étant un serveur statique sans réécriture
  serveur) l'ajout d'un `public/404.html` qui recharge `index.html`
  (pattern standard SPA-on-static-hosting), et vérification que
  Cloudflare (mode proxied) ne casse pas ce mécanisme.
- (b) Ne rien changer si le site reste volontairement une page unique à
  ancres internes plutôt que deux "pages" au sens SEO — option
  légitime vu la taille du site (2 routes, contenu Contact minimal),
  à condition de l'assumer consciemment plutôt que par défaut.

Je ne tranche pas cette décision seul (risque et réversibilité moyens,
touche à l'architecture de rendu que possède `architecte`) — je la pose
comme la priorité n°1 à arbitrer.

DONE SI : selon l'option retenue — (a) `curl -sI https://warattah.com/contact`
(ou équivalent, hors mandat SEO d'exécuter la commande soi-même) renvoie
`200` directement, sans dépendre du fragment, **et** l'outil Search
Console "Inspection d'URL" sur `https://warattah.com/contact` confirme
une exploration/un rendu distincts de la page d'accueil ; (b) décision
documentée explicitement (ex. dans `roadmap-implementation.md`) que le
choix d'une page unique est assumé, pas subi.

### P0 — Faible effort, correction directe

**2. Ajouter `public/robots.txt`**

DONE SI : `https://warattah.com/robots.txt` répond `200`, contient au
minimum `User-agent: *` / `Allow: /` et une ligne `Sitemap:` pointant
vers le sitemap de l'action 3 — vérifiable une fois déployé.

**3. Ajouter `public/sitemap.xml`**

Contenu proportionné à ce qui existe réellement aujourd'hui (une seule
URL crawlable tant que l'action 1 n'est pas tranchée — ne pas lister
`/contact` comme URL séparée tant que le blocage de fragment n'est pas
levé, ce serait un signal trompeur envoyé à Google).

DONE SI : `https://warattah.com/sitemap.xml` répond `200`, XML valide,
liste uniquement des URLs réellement servies en `200` sans dépendre d'un
fragment `#`.

**4. Title/description dynamiques par route et par langue résolue**

Nécessite un mécanisme (ex. `react-helmet-async`, absent des dépendances
actuelles — `package.json:12-27` — ou effets manuels `document.title`/
mise à jour de la balise meta description dans `I18nContext.jsx` ou par
route). Contrat pour `front` : le `title`/la `description` doivent
refléter `t.*` (langue résolue) et intégrer des repères factuels déjà
présents dans la bio (ex. "Warattah — Metal tribal, Nouvelle-Calédonie"
plutôt que "Warattah" seul) plutôt qu'une réécriture éditoriale que je ne
possède pas — la formulation finale reste à l'équipe éditoriale.

DONE SI : inspection du DOM rendu (ou "Tester l'URL en direct" / DOM
rendu de l'outil Search Console une fois disponible) montre un `<title>`
différent selon la langue résolue (`fr`/`en`/`es`), et une balise
`meta[name=description]` mise à jour de façon cohérente — vérification
manuelle en DevTools acceptable en attendant l'accès Search Console.

**5. Corriger `<html lang="fr">` figé**

Contrat pour `front` : mettre à jour `document.documentElement.lang`
dans `I18nContext.jsx` quand `resolvedLang` change, pour qu'il reflète
`fr`/`en`/`es` réellement affiché.

DONE SI : dans chacun des trois contextes de langue (testable en forçant
`sessionStorage.setItem('warattah_geo_lang', 'en'|'es'|'fr')` avant
rechargement, mécanisme déjà présent dans `I18nContext.jsx:18-19`),
l'attribut `lang` de `<html>` inspecté en DevTools correspond à la langue
réellement rendue.

### P1 — Effort modéré, gain qualifié

**6. Ajouter les balises Open Graph / Twitter Card statiques dans `index.html`**

Important de le faire dans le HTML brut (pas seulement en JS) — les
crawlers de partage social n'exécutent en général pas le JS de la page
(section 1.8). Contenu minimal : `og:title`, `og:description`, `og:image`
(prévoir un visuel dédié, ex. dérivé de `warattah-wordmark.svg` ou d'une
pochette d'album), `og:url`, `twitter:card`.

DONE SI : validation via un outil externe (Facebook Sharing Debugger,
Twitter/X Card Validator — outils que je ne peux pas exécuter moi-même,
à faire vérifier après déploiement) confirmant un aperçu correct sans
erreur de récupération.

**7. Ajouter un bloc `schema.org` `MusicGroup` en JSON-LD**

Champs minimaux réalistes à partir du contenu déjà existant : `name`,
`genre` ("tribal metal"), `foundingDate` (2006, `translations.js:10`),
`sameAs` (URL Bandcamp), `member`/`founder` (Khris,
`translations.js:19`) si le groupe souhaite l'exposer publiquement.

DONE SI : le bloc passe le Rich Results Test / Schema Markup Validator
de Google sans erreur (outil externe, à faire vérifier après déploiement
— je ne peux pas l'exécuter dans ce cycle). Rappel : **`MARKUP VALIDE ≠
GARANTIE DE RÉSULTAT ENRICHI`** — à présenter comme opportunité, jamais
comme un résultat garanti.

**8. Localiser les `alt` d'images de pochettes actuellement hardcodés en français**

`Home.jsx:93,98,115` — remplacer les chaînes françaises en dur par des
clés `t.*` cohérentes avec le reste du système i18n déjà utilisé pour le
texte de la page.

DONE SI : en forçant chacune des trois langues (mécanisme de l'action 5),
l'attribut `alt` des trois images concernées change de valeur en
conséquence.

**9. Renforcer le contenu textuel du `h1` de la page d'accueil**

Actuellement uniquement un `alt` d'image (`Home.jsx:48-50`). Ajouter un
texte réel (visuellement masqué si la direction artistique impose le
logo comme seul élément visible, mais présent dans le DOM) reprenant un
qualificatif déjà présent dans la bio (ex. "Warattah — Metal tribal,
Nouvelle-Calédonie"). Décision de formulation exacte laissée à l'équipe
éditoriale, pas à moi.

DONE SI : le `h1` de la page contient un noeud de texte lisible (pas
seulement un `alt` d'image), vérifiable par inspection du DOM/arbre
d'accessibilité.

### P2 — Dépendant d'une décision non encore tranchée, à ne pas exécuter isolément

**10. `hreflang`** — non actionnable tant que l'action 1 (ou une
alternative de segmentation d'URL par langue, ex. `/en/`, `/es/`, `/fr/`)
n'est pas tranchée. À ne pas traiter comme un point isolé — dépendance
explicite listée ici pour ne pas être oubliée une fois l'architecture
d'URL rediscutée.

**11. Vérification DNS/Cloudflare — [coordination requise : `devops`]**

Points à faire vérifier par `devops`, hors de ce que je peux constater
en lisant le code : absence de règle Cloudflare (WAF, "Bot Fight Mode")
qui bloquerait Googlebot ; canonicalisation effective entre
`warattah.com` et un éventuel `www.warattah.com` ; redirection HTTP→HTTPS
forcée. `public/CNAME:1` ne référence que `warattah.com` (apex), sans
indication d'une éventuelle configuration `www` côté DNS — **incertitude
explicite**, je n'ai pas accès à la configuration DNS/Cloudflare réelle.

DONE SI : `devops` confirme (test direct, pas supposition) qu'une requête
avec le user-agent Googlebot n'est pas bloquée par une règle Cloudflare,
et qu'une seule version canonique du domaine (avec ou sans `www`)
répond en `200` pendant que l'autre redirige en `301` vers elle.

---

## Récapitulatif

- **11 actions** dans le contrat d'implémentation (section 4), réparties
  en P0 bloquant structurel (1 action de décision architecturale), P0
  faible effort (4 actions), P1 effort modéré (4 actions), P2 dépendant
  d'une décision non tranchée (2 actions).
- Aucun fichier du dépôt n'a été modifié par cet audit — seul
  `seo-audit-warattah.md` a été créé.

## Incertitudes signalées faute d'outil (résumé)

- Statut d'indexation réel du domaine (Search Console) : inconnu, aucune
  donnée disponible pour un domaine tout juste connecté.
- Rendu effectif capturé par le Web Rendering Service de Google : non
  vérifiable sans Search Console.
- Existence de backlinks entrants historiques (presse metal 2006/2012
  mentionnée dans la bio) : non vérifiable sans outil de recherche de
  backlinks.
- Configuration DNS/Cloudflare réelle (proxy, WAF, doublon `www`) : non
  vérifiable sans accès `devops`.
- Validation externe des balises Open Graph et du balisage `schema.org`
  (Facebook Sharing Debugger, Rich Results Test) : à faire après
  déploiement, outils non exécutables dans ce cycle.
- Core Web Vitals terrain (PageSpeed Insights/CrUX) : hors mandat de cet
  audit (`front` les possède), et de toute façon non mesurable sans ces
  outils.
