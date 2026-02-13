// ===============================================================
// Liste des piliers et applications intégrées
// ===============================================================
const PILIERS = {
  SPORT: {
    nom: "Sport",
    icone: "💪",
    applications: {
      STRAVA: {
        id: "strava",
        nom: "Strava",
        logo_url: "/assets/logos/strava_logo.png",
        api_endpoint: "",
      },
    },
  },
  CULTURE: {
    nom: "Culture & Développement",
    icone: "📚",
    applications: {
      SPOTIFY: {
        id: "spotify",
        nom: "Spotify",
        logo_url: "/assets/logos/spotify_logo.png",
        api_endpoint: "",
      },
    },
  },
};

// ===============================================================
// Fonctions auxiliaires pour extraire les valeurs valides
// ===============================================================

// Récupère tous les noms de piliers disponibles
const getPiliersNames = () => {
  return Object.values(PILIERS).map((pilier) => pilier.nom);
};

// Récupère tous les IDs d'applications disponibles
const getApplicationsIds = () => {
  const apps = [];
  Object.values(PILIERS).forEach((pilier) => {
    Object.values(pilier.applications).forEach((app) => {
      apps.push(app.id);
    });
  });
  return apps;
};

module.exports = {
  PILIERS,
  getPiliersNames,
  getApplicationsIds,
};
