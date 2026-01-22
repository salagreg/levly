CREATE TABLE utilisateur (
  id SERIAL PRIMARY KEY NOT NULL,
  prenom VARCHAR(50) NOT NULL,
  nom VARCHAR(50) NOT NULL,
  date_de_naissance DATE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  mot_de_passe VARCHAR(255) NOT NULL,
  date_creation TIMESTAMPTZ NOT NULL DEFAULT now(), 
  date_maj TIMESTAMPTZ NOT NULL DEFAULT now()
);


CREATE TABLE pilier (
  id_pilier SERIAL PRIMARY KEY NOT NULL,
  id_utilisateur INT NOT NULL,
  nom_pilier VARCHAR(100) NOT NULL,
  duree_objectif_minutes INT NOT NULL,
  source_externe VARCHAR(50),
  pilier_actif BOOLEAN NOT NULL,

  -- Contraintes de clés étrangères
  FOREIGN KEY (id_utilisateur) REFERENCES utilisateur(id)
);


CREATE TABLE activite (
  id_activite SERIAL PRIMARY KEY NOT NULL,
  id_utilisateur INT NOT NULL,
  id_pilier INT NOT NULL,
  date_activite DATE NOT NULL,
  duree_minutes INT NOT NULL,
  source_externe VARCHAR(50),
  activite_validee BOOLEAN NOT NULL,

  -- Contraintes de clés étrangères
  FOREIGN KEY (id_utilisateur) REFERENCES utilisateur(id),
  FOREIGN KEY (id_pilier) REFERENCES pilier(id_pilier)
);


CREATE TABLE serie (
  id_serie SERIAL PRIMARY KEY NOT NULL,
  id_utilisateur INT NOT NULL,
  serie_actuelle INT NOT NULL,

  -- Contraintes de clés étrangères
  FOREIGN KEY (id_utilisateur) REFERENCES utilisateur(id)
);


CREATE TABLE jeton (
  id_jeton SERIAL PRIMARY KEY NOT NULL,
  id_utilisateur INT NOT NULL UNIQUE,
  nombre_jeton INT,
  origine_jeton VARCHAR(100),

  -- Contraintes de clés étrangères
  FOREIGN KEY (id_utilisateur) REFERENCES utilisateur(id)
);


CREATE TABLE administrateur (
  id_administrateur SERIAL PRIMARY KEY NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  mot_de_passe VARCHAR(255) NOT NULL,
  is_admin BOOLEAN
);
