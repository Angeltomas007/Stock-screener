# Europa Power Conference 2026 — mini-site

Site statique, sans build ni serveur applicatif : `index.html`, `styles.css`, `app.js`, `data.js`, et Leaflet 1.9.4 embarqué dans `vendor/` (BSD-2). Fonds de carte : OpenStreetMap.

## Mettre à jour le contenu
Tout le contenu est dans **`data.js`** (lieux, programme, infos pratiques, consignes équipes). Les rubriques vides affichent automatiquement un message « à venir ».
Pour tester l'affichage d'un autre moment : `index.html?now=2026-10-22T10:00`.

## Mettre en ligne
Déposer le dossier tel quel sur n'importe quel hébergement statique (Netlify Drop, GitHub Pages, OVH…). Pour retirer le site, il suffit de supprimer le dossier.

## Rubriques (liens directs partageables, ex. QR codes)
- `#programme` · `#programme/2026-10-22` (une journée) · `#programme/2026-10-22/<idLieu>` (journée + lieu)
- `#lieux` · `#lieux/<idLieu>` (lieu sélectionné sur la carte)
- `#infos` · `#equipes`

⚠️ La rubrique `#equipes` n'est **pas protégée** : toute personne disposant du lien peut la lire. N'y publier aucune information sensible (téléphones personnels, codes d'accès…).
