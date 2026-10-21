/*
 * Europa Power Conference 2026 — données du site
 * ------------------------------------------------
 * C'est le SEUL fichier à modifier pour mettre à jour le contenu.
 * Sources : programme officiel (PDF, 21–23 oct. 2026), guide « Comment rejoindre
 * les lieux depuis la gare » (FR/EN), concept-programme du Global Dialogue on Power.
 * Les titres de sessions sont conservés dans leur langue officielle (anglais).
 *
 * Formats : dates "AAAA-MM-JJ", heures "HH:MM". Un champ vide est masqué.
 * venues[].lat/lng : position du repère sur la carte (À VÉRIFIER avec la carte
 *   Google My Maps officielle — voir event.mapUrl). L'itinéraire utilise l'adresse.
 */
window.EVENT_DATA = {
  event: {
    name: "Europa Power Conference",
    year: "2026",
    tagline: "Europe’s Moment for Courage",
    organiser: "EuropaNova",
    city: "Strasbourg",
    start: "2026-10-21",
    end: "2026-10-23",
    intro:
      "Remettre la question de la puissance au cœur du projet européen, avec les dirigeants, la société civile et les citoyens. Deuxième conférence de l’Europa Power Initiative, fondée à Strasbourg en novembre 2025.",
    website: "https://europanova.eu/",
    mapUrl: "https://www.google.com/maps/d/viewer?mid=1olbeAOPe51ca4hUFfKxcH_CsZcXDZss&ll=48.60997402745793%2C7.707084667533914&z=15",
    transportUrl: "https://www.cts-strasbourg.eu/fr/accueil/index.html"
  },

  // Thèmes des six sessions de travail du 22 octobre.
  themes: [
    "Géopolitique, alliances, défense et sécurité",
    "Culture et patrimoine",
    "Démocratie, État de droit et médias",
    "Croissance, économie et progrès social",
    "Climat, énergie, science et technologie",
    "Science, innovation et technologie"
  ],

  // Intitulé de chaque journée (programme officiel).
  dayInfo: {
    "2026-10-21": { title: "Journée des réseaux", subtitle: "Why is a powerful Europe essential?", where: "Hôtel de Région · Hôtel de Ville · INSP · Crésus" },
    "2026-10-22": { title: "Conférence", subtitle: "Europe’s moment for courage", where: "Palais de la Musique et des Congrès" },
    "2026-10-23": { title: "Séance de clôture", subtitle: "Closing plenary", where: "Parlement européen" }
  },

  types: {
    pleniere: "Plénière",
    dialogue: "Global Dialogue",
    reseau: "Réseau",
    atelier: "Sessions de travail",
    culture: "Musique",
    reception: "Réception",
    pause: "Pause"
  },

  venues: [
    {
      id: "region",
      name: "Hôtel de Région Grand Est",
      short: "Hôtel de Région",
      address: "1 place Adrien-Zeller, 67000 Strasbourg",
      lat: 48.5968, lng: 7.7566,
      access: "Depuis la gare : tram C (dir. Neuhof Rodolphe Reuss) jusqu’à Homme de Fer, puis tram B (dir. Hœnheim Gare) jusqu’à Wacken. Environ 25–30 min.",
      info: "Global Dialogue on Power dans l’hémicycle (21 oct.). Dîner offert par la Région Grand Est (22 oct.)."
    },
    {
      id: "insp",
      name: "INSP — Institut national du service public",
      short: "INSP",
      address: "1 rue Sainte-Marguerite, 67000 Strasbourg",
      lat: 48.5806, lng: 7.7381,
      access: "Depuis la gare : environ 10–15 min à pied par la Petite rue de la Course, sur votre droite en sortant de la gare.",
      info: "European Youth Summit et réseau European Academics (21 oct.)."
    },
    {
      id: "hdv",
      name: "Hôtel de Ville de Strasbourg",
      short: "Hôtel de Ville",
      address: "9 rue Brûlée, 67000 Strasbourg",
      lat: 48.5853, lng: 7.7516,
      access: "Depuis la gare : tram C (dir. Neuhof Rodolphe Reuss) jusqu’à Broglie, puis 3 min à pied. Environ 10–15 min.",
      info: "Réseaux European Women, European Investors et European Tech Ecosystem, puis dîner-cocktail offert par la Ville (21 oct.)."
    },
    {
      id: "cresus",
      name: "Fédération Crésus — siège",
      short: "Crésus",
      address: "25 rue de Lausanne, 67000 Strasbourg",
      lat: 48.5749, lng: 7.7530,
      access: "Depuis la gare : tram A ou D (dir. Illkirch Graffenstaden, Kehl Rathaus ou Port du Rhin) jusqu’à Étoile Bourse, puis 5 min à pied. Environ 15–20 min.",
      info: "Réseau Social Enterprises & Impact Organisations (21 oct.)."
    },
    {
      id: "pmc",
      name: "Palais de la Musique et des Congrès (PMC)",
      short: "PMC",
      address: "Place de Bordeaux, 67000 Strasbourg",
      lat: 48.5925, lng: 7.7545,
      access: "Depuis la gare : tram C (dir. Neuhof Rodolphe Reuss) jusqu’à Homme de Fer, puis tram B (dir. Hœnheim Gare) jusqu’à Wacken, puis 5 min à pied. Environ 25–30 min.",
      info: "Plénières en Auditorium René Cassin. Pauses et déjeuner en Galerie Schweitzer. Sessions de travail et concert (22 oct.)."
    },
    {
      id: "pe",
      name: "Parlement européen — bâtiment Winston Churchill",
      short: "Parlement européen",
      address: "Avenue du Président Robert Schuman, 67000 Strasbourg",
      directions: "Parlement européen bâtiment Winston Churchill, Strasbourg",
      lat: 48.5958, lng: 7.7705,
      access: "Depuis la gare : bus 2 (toutes les 7 min, dir. Jardin des 2 Rives) jusqu’à Dordogne, puis 10 min à pied. Environ 25–35 min.",
      info: "Séance plénière de clôture (23 oct.). Prévoir du temps pour l’accréditation."
    }
  ],

  // Repères non numérotés affichés sur la carte.
  points: [
    { id: "gare", label: "Gare", name: "Gare centrale de Strasbourg", lat: 48.5850, lng: 7.7347 }
  ],

  /* Programme.
   * access : "invitation" | "inscription" | "groupes" (sur invitation / groupes)
   * people : [["Rôle", "Nom, Nom"], …] ; details : lignes de déroulé ou sous-sessions. */
  sessions: [
    // ---------- 21 octobre — Journée des réseaux ----------
    {
      day: "2026-10-21", start: "11:15", end: "16:00", type: "dialogue", venue: "region", room: "Hémicycle",
      title: "Global Dialogue on Power", access: "groupes",
      description: "Lancement d’une plateforme internationale de réflexion sur l’évolution de la puissance, avec des think tanks, diplomates et experts de toutes les régions du monde.",
      people: [
        ["Introductions", "Benjamin Haddad, Christian Debève, Guillaume Klossa"],
        ["Présidence", "António Vitorino"],
        ["Rapporteur général", "Bahadir Kaleağası"]
      ],
      details: [
        "11:15 – Opening : Why a worldwide dialogue on power?",
        "11:45 – Session 1 : Framing the new dimensions and implications of power",
        "13:15 – Déjeuner",
        "14:15 – Session 2 : Bringing perspectives together — from analysis to action",
        "15:45 – Conclusion"
      ]
    },
    {
      day: "2026-10-21", start: "15:00", end: "18:00", type: "reseau", venue: "insp",
      title: "European Youth Summit", subtitle: "Réseau 1 · 100 jeunes volontaires européens",
      people: [["Co-présidence", "Benjamin Sibille"], ["Keynote", "Costas Kadis"]],
      partners: "Collective for a European Civic Service"
    },
    {
      day: "2026-10-21", start: "15:00", end: "18:00", type: "reseau", venue: "hdv",
      title: "European Women", subtitle: "Réseau 2",
      people: [["Co-présidence", "Véronique Auger, Marie-Christine Vallet"], ["Intervenante", "Sophie Bourel"]],
      partners: "Women for European Citizenship ; European Women in VC"
    },
    {
      day: "2026-10-21", start: "15:00", end: "18:00", type: "reseau", venue: "hdv",
      title: "European Investors", subtitle: "Réseau 3",
      people: [["Co-présidence", "Kinga Stanislawska, Sophie Javary"], ["Invitée", "Nina Rawal"]],
      partners: "Eurazeo ; BNP Paribas"
    },
    {
      day: "2026-10-21", start: "15:00", end: "18:00", type: "reseau", venue: "hdv",
      title: "European Tech Ecosystem", subtitle: "Réseau 4",
      people: [["Co-présidence", "Andrzej Voigt, Philippe Roncati"]],
      partners: "Cartes Bancaires, Sopra Steria, STRIKX, Libralis"
    },
    {
      day: "2026-10-21", start: "15:00", end: "18:00", type: "reseau", venue: "insp",
      title: "European Academics", subtitle: "Réseau 5",
      people: [["Co-présidence", "Frédérique Berrod, Hervé Moritz"]],
      partners: "Université de Strasbourg, ESCP, Académie royale de Belgique, Académie polonaise des sciences"
    },
    {
      day: "2026-10-21", start: "15:00", end: "18:00", type: "reseau", venue: "cresus",
      title: "Social Enterprises & Impact Organisations", subtitle: "Réseau 6",
      people: [["Co-présidence", "Wieteke Dupain, Pauline Dujardin"]],
      partners: "Fédération Crésus, Euclid Network"
    },
    {
      day: "2026-10-21", start: "19:00", end: "21:00", type: "reception", venue: "hdv", access: "invitation",
      title: "Dîner-cocktail", subtitle: "Offert par la Ville de Strasbourg",
      people: [["Musique", "Yury Revich"]]
    },

    // ---------- 22 octobre — Conférence (PMC) ----------
    {
      day: "2026-10-22", start: "09:00", end: "09:30", type: "pleniere", venue: "pmc", room: "Auditorium René Cassin", access: "inscription",
      title: "Welcome address",
      people: [["Allocutions", "Catherine Trautmann, Pascale Schmidiger, Brigitte Torloting, Guillaume Klossa"], ["Animation de la journée", "Cathie Burton"]]
    },
    {
      day: "2026-10-22", start: "09:30", end: "10:10", type: "pleniere", venue: "pmc", room: "Auditorium René Cassin", access: "inscription",
      title: "The leading voices of Europe: the dimensions of power",
      people: [
        ["Modération", "Nicolas Schmit"],
        ["Building Europe’s capacity to act", "Michiel Scheffer, William Kadouch-Chassaing, Anna Christmann"],
        ["The power of Europe’s values and society", "Maria João Rodrigues, Józef Wancer, Yury Revich, Michael McGrath"]
      ]
    },
    {
      day: "2026-10-22", start: "10:10", end: "10:25", type: "pleniere", venue: "pmc", room: "Auditorium René Cassin", access: "inscription",
      title: "Voice of Europeans — What are Europeans telling us?",
      people: [["Intervenants", "Roland Abold, Isabelle Schwarz"]]
    },
    {
      day: "2026-10-22", start: "10:25", end: "10:35", type: "pleniere", venue: "pmc", room: "Auditorium René Cassin", access: "inscription",
      title: "Keynote: Europe’s power begins with the rule of law",
      people: [["Keynote", "Kateřina Šimáčková"]]
    },
    {
      day: "2026-10-22", start: "10:35", end: "11:05", type: "pleniere", venue: "pmc", room: "Auditorium René Cassin", access: "inscription",
      title: "Wider Union: a vision of Europe as a global power?",
      people: [["Modération", "Dave Keating"], ["Intervenants", "Meglena Kuneva, Gilles Briatta, Nicolas Mackel, Bahadir Kaleağası, Sven Franck, Dubravka Šuica"]]
    },
    {
      day: "2026-10-22", start: "11:05", end: "11:30", type: "pause", venue: "pmc", room: "Galerie Schweitzer",
      title: "Pause café"
    },
    {
      day: "2026-10-22", start: "11:30", end: "12:00", type: "pleniere", venue: "pmc", room: "Auditorium René Cassin", access: "inscription",
      title: "Can Europe defend itself?",
      people: [["Modération", "Gilles Oubuih"], ["Intervenants", "Vytautas Leškevičius, Eric Autellet, Franz Xaver Pfrengle, Leyla Kayacik"]]
    },
    {
      day: "2026-10-22", start: "12:00", end: "12:45", type: "pleniere", venue: "pmc", room: "Auditorium René Cassin", access: "inscription",
      title: "Europa Power Initiative networks: the voice of civil society",
      people: [
        ["Modération", "Antoine Sire"],
        ["Intervenants", "Elise Cuny, Paddy Siyanga Knudsen, Benjamin Sibille, Véronique Auger, Felix Kubitschek, Kinga Stanislawska, Eszter Kantor, Godelieve Laureys, Thierry Coulhon, Wieteke Dupain"]
      ]
    },
    {
      day: "2026-10-22", start: "12:45", end: "14:00", type: "pause", venue: "pmc", room: "Galerie Schweitzer", access: "invitation",
      title: "Déjeuner"
    },
    {
      day: "2026-10-22", start: "14:00", end: "14:45", type: "pleniere", venue: "pmc", room: "Auditorium René Cassin", access: "inscription",
      title: "Regions, cities and local authorities: multiplying European power through its territories",
      people: [["Modération", "Dave Keating"], ["Intervenants", "Franck Leroy, Catherine Trautmann, Pascale Schmidiger, Christophe Rouillon, María Ubarretxena"]]
    },
    {
      day: "2026-10-22", start: "14:45", end: "15:10", type: "pleniere", venue: "pmc", room: "Auditorium René Cassin", access: "inscription",
      title: "The AI revolution and the future of work",
      people: [["Modération", "Cathie Burton"], ["Intervenants", "Esther Lynch, Maria João Rodrigues, Guillaume Klossa"]]
    },
    {
      day: "2026-10-22", start: "15:30", end: "17:30", type: "atelier", venue: "pmc", access: "groupes",
      title: "Sessions de travail (6 en parallèle)",
      details: [
        "01 · Geopolitics — Europe in the world: alliances, defence & security — Meglena Kuneva, Karolina Boronska-Hryniewiecka",
        "02 · Culture & heritage — Elise Cuny, Bilal Alnemr",
        "03 · Democracy, rule of law & media — Mateusz Mazzini, Clarisse Feletin",
        "04 · Growth, economy & social progress — Carole Grandjouan, Wolfgang Pinner",
        "05 · Climate, energy, science & technology — Laurence Thebault, Meyrem Almaci",
        "06 · Science, innovation & technology — Maria João Rodrigues, Philippe Roncati"
      ]
    },
    {
      day: "2026-10-22", start: "17:45", end: "18:45", type: "culture", venue: "pmc", room: "Auditorium René Cassin", access: "invitation",
      title: "Concert by Pax Musica",
      people: [["Ensemble", "Quatuor KolossSax"]]
    },
    {
      day: "2026-10-22", start: "19:00", end: "22:00", type: "reception", venue: "region", access: "invitation",
      title: "Dîner", subtitle: "Offert par la Région Grand Est",
      people: [["Musique", "Pax Musica, Quatuor KolossSax"]]
    },

    // ---------- 23 octobre — Clôture (Parlement européen) ----------
    {
      day: "2026-10-23", start: "09:00", end: "09:05", type: "culture", venue: "pe", access: "inscription",
      title: "Ode to Joy — European anthem",
      people: [["Violon", "Bilal Al Nemr"]]
    },
    {
      day: "2026-10-23", start: "09:05", end: "09:20", type: "pleniere", venue: "pe", access: "inscription",
      title: "Welcome address",
      people: [["Allocutions", "Leyla Kayacik, Fabienne Keller"]]
    },
    {
      day: "2026-10-23", start: "09:20", end: "09:50", type: "pleniere", venue: "pe", access: "inscription",
      title: "Keynotes",
      people: [["Keynotes", "François Villeroy de Galhau, Jean-Pierre Bourguignon"]]
    },
    {
      day: "2026-10-23", start: "09:50", end: "10:50", type: "pleniere", venue: "pe", access: "inscription",
      title: "10 key challenges to transform Europe into a super democratic power",
      people: [
        ["Intervenants", "Nathalie Roos, Isabelle Schwarz, Karolina Boronska-Hryniewiecka, Meyrem Almaci, Maria João Rodrigues, Mateusz Mazzini"],
        ["Commentaires", "Guillaume Klossa"]
      ]
    },
    {
      day: "2026-10-23", start: "10:50", end: "11:20", type: "pause", venue: "pe", room: "Espace d’accueil",
      title: "Pause café"
    },
    {
      day: "2026-10-23", start: "11:20", end: "11:35", type: "pleniere", venue: "pe", access: "inscription",
      title: "Towards a European power",
      people: [["Intervenant", "Hajdu Gábor"]]
    },
    {
      day: "2026-10-23", start: "11:35", end: "11:40", type: "pleniere", venue: "pe", access: "inscription",
      title: "Next steps of the Europa Power Initiative",
      people: [["Intervenante", "Agnieszka Jaros"]]
    },
    {
      day: "2026-10-23", start: "11:40", end: "12:00", type: "pleniere", venue: "pe", access: "inscription",
      title: "Closing remarks",
      people: [["Intervenants", "Guillaume Klossa, Marinella Linati, Hervé Moritz, Jean-Marc Lieberherr Monnet"]]
    }
  ],

  accessLabels: {
    invitation: "Sur invitation",
    inscription: "Sur inscription",
    groupes: "Sur invitation / groupes"
  },

  practical: {
    transport: [
      "Les lieux sont accessibles depuis la gare centrale en tram, en bus ou à pied. Les durées indiquées incluent la marche depuis l’arrêt. Prévoyez une marge pour les correspondances.",
      "Les itinéraires peuvent varier selon les travaux et horaires du réseau CTS : vérifiez votre trajet avant le départ.",
      "Parlement européen (23 oct.) : prévoyez du temps supplémentaire pour l’accréditation."
    ],
    hotels: [
      { name: "Grand Hôtel", address: "12 place de la Gare, 67000 Strasbourg", route: "À pied, environ 2 min depuis la gare." },
      { name: "IBIS Strasbourg Centre Petite France", address: "18 rue du Faubourg-National, 67000 Strasbourg", route: "À pied, environ 5–7 min." },
      { name: "BOMA", address: "7 rue du 22 Novembre, 67000 Strasbourg", route: "À pied, environ 8 min." },
      { name: "AC Hotel by Marriott et Residence Inn by Marriott", address: "4–6 boulevard de Dresde, 67000 Strasbourg", route: "Bus H (dir. Parlement Européen) jusqu’à Wacken, puis 2–4 min à pied ; ou tram C puis tram B jusqu’à Wacken. Environ 15–20 min." },
      { name: "Hilton Strasbourg", address: "1 avenue Herrenschmidt, 67000 Strasbourg", route: "Tram C jusqu’à Homme de Fer, puis tram B (dir. Hœnheim Gare) jusqu’à Lycée Kléber. Environ 20 min." },
      { name: "IBIS Styles Strasbourg Nord Palais des Congrès", address: "6 avenue Pierre-Mendès-France, 67300 Schiltigheim", route: "Tram C jusqu’à Homme de Fer, puis tram B (dir. Hœnheim Gare) jusqu’à Futura Glacière, puis 1–2 min à pied. Environ 25–30 min." }
    ],
    contacts: [
      { label: "Taxi 13 Strasbourg", value: "+33 3 88 36 13 13", href: "tel:+33388361313" },
      { label: "Transports en commun", value: "CTS — horaires et itinéraires", href: "https://www.cts-strasbourg.eu/fr/accueil/index.html" }
    ],
    documents: [
      { label: "Programme officiel (PDF, EN)", href: "docs/Europa-Power-Conference-2026-programme.pdf" },
      { label: "Guide d’accès depuis la gare (PDF, FR/EN)", href: "docs/Guide-acces-depuis-la-gare-FR-EN.pdf" },
      { label: "Déclaration de Strasbourg 2025 (PDF, EN)", href: "docs/Declaration-of-Strasbourg-2025-EN.pdf" }
    ]
  },

  // Rubrique interne équipes. Le déroulé par lieu est généré automatiquement depuis le programme.
  team: {
    sections: [
      {
        title: "Points de vigilance (documents officiels)",
        items: [
          "21 oct. : le Global Dialogue (Hôtel de Région, jusqu’à 16:00) et les réunions des six réseaux (15:00–18:00) se chevauchent, sur quatre lieux différents.",
          "22 oct. : plénières sur inscription ; déjeuner, concert et dîner sur invitation ; sessions de travail sur invitation / groupes.",
          "22 oct. au soir : le dîner a lieu à l’Hôtel de Région, voisin du PMC (même arrêt de tram : Wacken).",
          "23 oct. : prévoir du temps pour l’accréditation à l’entrée du Parlement européen (bâtiment Winston Churchill).",
          "Orienter les participants vers la rubrique « Lieux & carte » : itinéraire depuis la gare pour chaque site."
        ]
      }
    ],
    contacts: []
  }
};
