-- Script seed.sql - Données de test pour Levly
-- Ce fichier crée des utilisateurs et un admin de test

-- ============================================
-- NETTOYAGE (supprime toutes les données)
-- ============================================
TRUNCATE TABLE activite CASCADE;
TRUNCATE TABLE serie CASCADE;
TRUNCATE TABLE jeton CASCADE;
TRUNCATE TABLE pilier CASCADE;
TRUNCATE TABLE utilisateur CASCADE;
TRUNCATE TABLE administrateur CASCADE;

-- ============================================
-- RESET DES SÉQUENCES (pour avoir id=1)
-- ============================================
ALTER SEQUENCE utilisateur_id_seq RESTART WITH 1;
ALTER SEQUENCE pilier_id_pilier_seq RESTART WITH 1;
ALTER SEQUENCE jeton_id_jeton_seq RESTART WITH 1;
ALTER SEQUENCE serie_id_serie_seq RESTART WITH 1;
ALTER SEQUENCE activite_id_activite_seq RESTART WITH 1;
ALTER SEQUENCE administrateur_id_administrateur_seq RESTART WITH 1;

-- ============================================
-- UTILISATEURS DE TEST
-- ============================================

-- Utilisateur 1 : Grégory (compte actif)
-- Mot de passe : password123 (hashé avec bcrypt)
INSERT INTO utilisateur (prenom, nom, date_de_naissance, email, mot_de_passe, compte_actif)
VALUES 
  ('Grégory', 'Sala', '1995-05-15', 'gregory@levly.com', '$2b$10$8JfUmbwVmT9vEgdIzpUA0.MlgxTcHN8fgpqNcacVE20o/0xjC079q', true);

-- Utilisateur 2 : Test User (compte actif)
-- Mot de passe : test123
INSERT INTO utilisateur (prenom, nom, date_de_naissance, email, mot_de_passe, compte_actif)
VALUES 
  ('Test', 'User', '1990-01-01', 'test@levly.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', true);

-- Utilisateur 3 : Compte désactivé (pour tester)
-- Mot de passe : disabled123
INSERT INTO utilisateur (prenom, nom, date_de_naissance, email, mot_de_passe, compte_actif)
VALUES 
  ('Compte', 'Désactivé', '1985-12-25', 'disabled@levly.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', false);

-- ============================================
-- ADMINISTRATEUR DE TEST
-- ============================================

-- Admin : admin@levly.com
-- Mot de passe : admin123
INSERT INTO administrateur (email, mot_de_passe, is_admin)
VALUES 
  ('admin@levly.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', true);

-- ============================================
-- PILIERS DE TEST (pour Grégory uniquement)
-- ============================================

INSERT INTO pilier (id_utilisateur, nom_pilier, source_externe, pilier_actif, objectif_config)
VALUES 
  (1, 'Sport', 'strava', true, '{"type": "duree", "objectif_minutes": 30}'::jsonb),
  (1, 'Culture & Développement', 'spotify', true, '{"type": "duree", "objectif_minutes": 20}'::jsonb);

-- ============================================
-- SÉRIE DE TEST (pour Grégory)
-- ============================================

INSERT INTO serie (id_utilisateur, serie_actuelle)
VALUES 
  (1, 60);

-- ============================================
-- JETONS DE TEST (pour Grégory)
-- ============================================

INSERT INTO jeton (id_utilisateur, montant_jeton, origine_jeton)
VALUES 
  (1, 1240, 'inscription');

-- ============================================
-- VÉRIFICATION
-- ============================================

SELECT 'Utilisateurs créés :' AS info;
SELECT id, prenom, nom, email, compte_actif FROM utilisateur;

SELECT 'Administrateurs créés :' AS info;
SELECT id_administrateur, email, is_admin FROM administrateur;

SELECT 'Piliers créés :' AS info;
SELECT id_pilier, nom_pilier, objectif_config FROM pilier;

SELECT 'Jetons créés :' AS info;
SELECT id_jeton, id_utilisateur, montant_jeton FROM jeton;

SELECT 'Séries créées :' AS info;
SELECT id_serie, id_utilisateur, serie_actuelle FROM serie;

SELECT '✅ Seed terminé avec succès !' AS info;

-- ============================================
-- NOTES IMPORTANTES
-- ============================================
-- 
-- 📝 Mot de passe pour Grégory : "password123"
-- 
-- 🔐 Pour te connecter en dev :
-- Email : gregory@levly.com
-- Mot de passe : password123
-- 
-- 🔐 Pour te connecter en tant qu'admin :
-- Email : admin@levly.com
-- Mot de passe : admin123