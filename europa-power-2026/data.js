/*
 * Europa Power Conference 2026 — données du site
 * ------------------------------------------------
 * C'est le SEUL fichier à modifier pour mettre à jour le site.
 * Règle : n'ajouter que des informations confirmées par les documents officiels.
 * Un champ laissé vide ("" ou []) est simplement masqué ou remplacé par
 * un message « à venir » ; rien n'est affiché par défaut.
 *
 * Formats :
 *  - dates : "AAAA-MM-JJ" ; heures : "HH:MM" (24 h)
 *  - venues[].id : identifiant court sans espace, réutilisé dans sessions[].venue
 *  - venues[].lat / lng : coordonnées décimales (clic droit > coordonnées dans Google Maps)
 *  - sessions[].type : une clé de "types" ci-dessous
 */
window.EVENT_DATA = {
  event: {
    name: "Europa Power Conference",
    year: "2026",
    edition: "2e édition",
    organiser: "EuropaNova",
    city: "Strasbourg",
    start: "2026-10-21",
    end: "2026-10-23",
    intro:
      "Trois jours de sessions plénières, de groupes de travail stratégiques, de forums citoyens et de débats publics à Strasbourg, consacrés à l’avenir et à la puissance de l’Europe.",
    themes: [
      "Sécurité et défense",
      "Science et technologie",
      "Souveraineté énergétique",
      "Démocratie et État de droit",
      "Compétitivité économique et industrielle",
      "Culture"
    ],
    website: "https://europanova.eu/"
  },

  // Types d'événements (clé → libellé). Utilisés pour les filtres et les badges.
  types: {
    pleniere: "Session plénière",
    atelier: "Groupe de travail",
    forum: "Forum citoyen",
    rencontre: "Rencontre",
    debat: "Débat public",
    culture: "Événement culturel",
    pratique: "Accueil / pause"
  },

  /* Lieux — À COMPLÉTER depuis le programme officiel.
   * Exemple de structure :
   * {
   *   id: "lieu1",
   *   name: "Nom officiel du lieu",
   *   address: "Adresse complète, 67000 Strasbourg",
   *   lat: 48.0000, lng: 7.0000,
   *   access: "Tram X — arrêt Y",        // optionnel
   *   info: "Entrée par …, badge requis", // optionnel
   *   url: ""                            // optionnel
   * }
   */
  venues: [],

  /* Programme — À COMPLÉTER.
   * { day: "2026-10-21", start: "09:00", end: "10:30",
   *   title: "Titre officiel", type: "pleniere", venue: "lieu1",
   *   description: "" }  // description optionnelle
   */
  sessions: [],

  // Informations pratiques destinées aux participants.
  practical: {
    transport: [],     // ex. "Gare de Strasbourg : tram A/D …"
    instructions: [],  // consignes participants
    contacts: []       // { label: "Accueil", value: "…", href: "mailto:…" }
  },

  // Rubrique interne équipes (hôtes, hôtesses, organisation).
  team: {
    sections: [],      // { title: "Accueil des invités", items: ["…", "…"] }
    contacts: []       // { label: "Coordination", value: "…", href: "tel:…" }
  }
};
