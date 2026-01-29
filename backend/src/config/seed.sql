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
-- UTILISATEURS DE TEST
-- ============================================

-- Utilisateur 1 : Grégory (compte actif)
-- Mot de passe : password123 (hashé avec bcrypt)
-- Hash bcrypt pour "password123" : $2b$10$YourHashHere
INSERT INTO utilisateur (prenom, nom, date_de_naissance, email, mot_de_passe, compte_actif)
VALUES 
  ('Grégory', 'Sala', '1995-05-15', 'gregory@levly.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', true);

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

INSERT INTO pilier (id_utilisateur, nom_pilier, duree_objectif_minutes, source_externe, pilier_actif)
VALUES 
  (1, 'Sport', 30, 'Strava', true),
  (1, 'Culture & Développement', 20, 'Spotify', true);

-- ============================================
-- SÉRIE DE TEST (pour Grégory)
-- ============================================

INSERT INTO serie (id_utilisateur, serie_actuelle)
VALUES 
  (1, 0);

-- ============================================
-- JETONS DE TEST (pour Grégory)
-- ============================================

INSERT INTO jeton (id_utilisateur, nombre_jeton, origine_jeton)
VALUES 
  (1, 0, 'inscription');

-- ============================================
-- VÉRIFICATION
-- ============================================

SELECT 'Utilisateurs créés :' AS info;
SELECT id, prenom, nom, email, compte_actif FROM utilisateur;

SELECT 'Administrateurs créés :' AS info;
SELECT id_administrateur, email, is_admin FROM administrateur;

SELECT 'Piliers créés :' AS info;
SELECT id_pilier, nom_pilier, duree_objectif_minutes FROM pilier;

SELECT '✅ Seed terminé avec succès !' AS info;

-- ============================================
-- NOTES IMPORTANTES
-- ============================================
-- 
-- 📝 Tous les mots de passe de test sont : "password123"
-- 
-- ⚠️ Le hash bcrypt utilisé ici est un exemple générique.
-- Lors du développement réel, ces mots de passe seront hashés 
-- par l'API lors de l'inscription.
-- 
-- 🔐 Pour te connecter en dev :
-- Email : gregory@levly.com
-- Mot de passe : password123
-- 
-- 🔐 Pour te connecter en tant qu'admin :
-- Email : admin@levly.com
-- Mot de passe : admin123
