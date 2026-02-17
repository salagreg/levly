CREATE TABLE utilisateur (
  id SERIAL PRIMARY KEY NOT NULL,
  prenom VARCHAR(50) NOT NULL,
  nom VARCHAR(50) NOT NULL,
  date_de_naissance DATE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  mot_de_passe VARCHAR(255) NOT NULL,
  compte_actif BOOLEAN NOT NULL DEFAULT true,
  date_creation TIMESTAMPTZ NOT NULL DEFAULT now(), 
  date_maj TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE pilier (
  id_pilier SERIAL PRIMARY KEY NOT NULL,
  id_utilisateur INT NOT NULL,
  nom_pilier VARCHAR(100) NOT NULL,
  source_externe VARCHAR(50) NOT NULL,
  type_validation VARCHAR(20) NOT NULL DEFAULT 'duree',
  
  -- Configuration flexible en JSON
  objectif_config JSONB NOT NULL,
  
  pilier_actif BOOLEAN NOT NULL DEFAULT true,

  -- Colonnes OAuth pour les intégrations externes
  access_token TEXT,
  refresh_token TEXT,
  token_expires_at BIGINT,

  date_creation TIMESTAMPTZ NOT NULL DEFAULT now(),
  date_maj TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Contraintes de clés étrangères
  FOREIGN KEY (id_utilisateur) REFERENCES utilisateur(id) ON DELETE CASCADE
);

CREATE TABLE activite (
  id_activite SERIAL PRIMARY KEY NOT NULL,
  id_utilisateur INT NOT NULL,
  id_pilier INT NOT NULL,
  date_activite DATE NOT NULL,
  duree_minutes INT,
  source_externe VARCHAR(50),
  activite_validee BOOLEAN NOT NULL,
  nombre_episodes INT,

  -- Contraintes de clés étrangères
  FOREIGN KEY (id_utilisateur) REFERENCES utilisateur(id) ON DELETE CASCADE,
  FOREIGN KEY (id_pilier) REFERENCES pilier(id_pilier) ON DELETE CASCADE
);

CREATE TABLE serie (
  id_serie SERIAL PRIMARY KEY NOT NULL,
  id_utilisateur INT UNIQUE NOT NULL,
  serie_actuelle INT NOT NULL,
  derniere_validation DATE;

  -- Contraintes de clés étrangères
  FOREIGN KEY (id_utilisateur) REFERENCES utilisateur(id) ON DELETE CASCADE
);

CREATE TABLE jeton (
  id_jeton SERIAL PRIMARY KEY NOT NULL,
  id_utilisateur INT NOT NULL,
  montant_jeton INT NOT NULL,
  origine_jeton VARCHAR(100) NOT NULL,
  date_creation TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Contraintes de clés étrangères
  FOREIGN KEY (id_utilisateur) REFERENCES utilisateur(id) ON DELETE CASCADE
);

CREATE TABLE administrateur (
  id_administrateur SERIAL PRIMARY KEY NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  mot_de_passe VARCHAR(255) NOT NULL,
  is_admin BOOLEAN
);
