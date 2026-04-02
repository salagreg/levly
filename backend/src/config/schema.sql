-- ================================================================
-- Schema Levly
-- ================================================================

-- ================================================================
-- Table : utilisateur
-- ================================================================
CREATE TABLE utilisateur (
  id                SERIAL PRIMARY KEY NOT NULL,
  prenom            VARCHAR(50) NOT NULL,
  nom               VARCHAR(50) NOT NULL,
  date_de_naissance DATE NOT NULL,
  email             VARCHAR(100) UNIQUE NOT NULL,
  mot_de_passe      VARCHAR(255) NOT NULL,
  compte_actif      BOOLEAN NOT NULL DEFAULT true,
  date_creation     TIMESTAMPTZ NOT NULL DEFAULT now(),
  date_maj          TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ================================================================
-- Table : pilier
-- Les tokens OAuth sont déplacés dans oauth_connection
-- ================================================================
CREATE TABLE pilier (
  id_pilier         SERIAL PRIMARY KEY NOT NULL,
  id_utilisateur    INT NOT NULL,
  nom_pilier        VARCHAR(100) NOT NULL,
  source_externe    VARCHAR(50) NOT NULL,
  type_validation   VARCHAR(20) DEFAULT 'duree',
  objectif_config   JSONB NOT NULL,
  pilier_actif      BOOLEAN NOT NULL DEFAULT true,
  date_creation     TIMESTAMPTZ NOT NULL DEFAULT now(),
  date_maj          TIMESTAMPTZ NOT NULL DEFAULT now(),

  FOREIGN KEY (id_utilisateur) REFERENCES utilisateur(id)
);

-- ================================================================
-- Table : oauth_connection
-- Centralise toutes les connexions OAuth externes (Strava, Garmin...)
-- Une ligne par utilisateur par service
-- ================================================================
CREATE TABLE oauth_connection (
  id                SERIAL PRIMARY KEY,
  id_utilisateur    INT NOT NULL,
  source_externe    VARCHAR(50) NOT NULL,
  external_user_id  VARCHAR(100) NOT NULL,
  access_token      VARCHAR(255),
  refresh_token     VARCHAR(255),
  token_expires_at  BIGINT,
  date_creation     TIMESTAMPTZ NOT NULL DEFAULT now(),
  date_maj          TIMESTAMPTZ NOT NULL DEFAULT now(),

  FOREIGN KEY (id_utilisateur) REFERENCES utilisateur(id) ON DELETE CASCADE,
  UNIQUE (source_externe, external_user_id)
);

CREATE INDEX idx_oauth_user ON oauth_connection(id_utilisateur);
CREATE INDEX idx_oauth_source ON oauth_connection(source_externe, external_user_id);

-- ================================================================
-- Table : activite
-- ================================================================
CREATE TABLE activite (
  id_activite       SERIAL PRIMARY KEY NOT NULL,
  id_utilisateur    INT NOT NULL,
  id_pilier         INT NOT NULL,
  date_activite     DATE NOT NULL,
  duree_minutes     INT,
  source_externe    VARCHAR(50),
  activite_validee  BOOLEAN NOT NULL,

  FOREIGN KEY (id_utilisateur) REFERENCES utilisateur(id),
  FOREIGN KEY (id_pilier) REFERENCES pilier(id_pilier),

  CONSTRAINT unique_activite_jour
    UNIQUE (id_utilisateur, id_pilier, date_activite)
);

-- ================================================================
-- Table : serie
-- ================================================================
CREATE TABLE serie (
  id_serie             SERIAL PRIMARY KEY NOT NULL,
  id_utilisateur       INT UNIQUE NOT NULL,
  serie_actuelle       INT NOT NULL DEFAULT 0,
  derniere_validation  DATE,
  date_maj             TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (id_utilisateur) REFERENCES utilisateur(id)
);

-- ================================================================
-- Table : jeton
-- ================================================================
CREATE TABLE jeton (
  id_jeton        SERIAL PRIMARY KEY NOT NULL,
  id_utilisateur  INT NOT NULL,
  montant_jeton   INT NOT NULL,
  origine_jeton   VARCHAR(100) NOT NULL,
  date_creation   TIMESTAMPTZ NOT NULL DEFAULT now(),

  FOREIGN KEY (id_utilisateur) REFERENCES utilisateur(id) ON DELETE CASCADE
);

CREATE INDEX idx_jeton_user ON jeton(id_utilisateur);

-- ================================================================
-- Table : administrateur
-- ================================================================
CREATE TABLE administrateur (
  id_administrateur  SERIAL PRIMARY KEY NOT NULL,
  email              VARCHAR(100) UNIQUE NOT NULL,
  mot_de_passe       VARCHAR(255) NOT NULL,
  is_admin           BOOLEAN
);
