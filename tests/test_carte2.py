#!/usr/bin/env python3
"""
Script de tests automatisés - CARTE 2 : Synchronisation Strava/Spotify
Tests de cohérence BDD et structure piliers
"""

import requests
import psycopg2
from psycopg2.extras import RealDictCursor
import json
from datetime import datetime, timedelta
import time
from colorama import Fore, Style, init

# Initialiser colorama
init(autoreset=True)

# ====================================
# CONFIGURATION
# ====================================

# Configuration BDD PostgreSQL
DB_CONFIG = {
    "host": "localhost",
    "database": "levly_db",
    "user": "gregory",
    "password": "Titi7512!",
    "port": 5432
}

# ====================================
# CLASSES & HELPERS
# ====================================

class TestResult:
    def __init__(self):
        self.total = 0
        self.passed = 0
        self.failed = 0
        self.tests = []
    
    def add_test(self, name, passed, message=""):
        self.total += 1
        if passed:
            self.passed += 1
            print(f"{Fore.GREEN}✅ PASS{Style.RESET_ALL} - {name}")
        else:
            self.failed += 1
            print(f"{Fore.RED}❌ FAIL{Style.RESET_ALL} - {name}")
            if message:
                print(f"  {Fore.YELLOW}└─ {message}{Style.RESET_ALL}")
        
        self.tests.append({
            "name": name,
            "passed": passed,
            "message": message
        })
    
    def print_summary(self):
        print("\n" + "="*70)
        print(f"{Fore.CYAN}📊 RÉSUMÉ DES TESTS - CARTE 2{Style.RESET_ALL}")
        print("="*70)
        print(f"Total tests : {self.total}")
        print(f"{Fore.GREEN}✅ Réussis : {self.passed}{Style.RESET_ALL}")
        print(f"{Fore.RED}❌ Échoués : {self.failed}{Style.RESET_ALL}")
        
        percentage = (self.passed / self.total * 100) if self.total > 0 else 0
        print(f"Taux de réussite : {percentage:.1f}%")
        print("="*70)

class DatabaseHelper:
    def __init__(self, config):
        self.config = config
        self.conn = None
    
    def connect(self):
        try:
            self.conn = psycopg2.connect(**self.config, cursor_factory=RealDictCursor)
            return True
        except Exception as e:
            print(f"{Fore.RED}❌ Erreur connexion BDD: {e}{Style.RESET_ALL}")
            return False
    
    def execute(self, query, params=None, fetch=False):
        try:
            cursor = self.conn.cursor()
            cursor.execute(query, params)
            
            if fetch:
                result = cursor.fetchall()
                cursor.close()
                return result
            else:
                self.conn.commit()
                cursor.close()
                return True
        except Exception as e:
            self.conn.rollback()
            print(f"{Fore.RED}❌ Erreur SQL: {e}{Style.RESET_ALL}")
            return None if fetch else False
    
    def close(self):
        if self.conn:
            self.conn.close()

# ====================================
# SETUP & CLEANUP
# ====================================

def setup_test_user(db):
    """Créer un utilisateur test avec piliers"""
    print(f"\n{Fore.CYAN}🔧 SETUP : Création utilisateur test{Style.RESET_ALL}")
    print("-" * 70)
    
    timestamp = int(time.time())
    email = f"test.carte2.{timestamp}@levly.com"
    
    # Créer utilisateur
    query_user = """
        INSERT INTO utilisateur (prenom, nom, date_de_naissance, email, mot_de_passe, compte_actif)
        VALUES (%s, %s, %s, %s, %s, %s)
        RETURNING id
    """
    
    result = db.execute(
        query_user,
        ("Test", "Carte2", "1990-01-01", email, "hashed_password_fake", True),
        fetch=True
    )
    
    if not result:
        return None, None, None
    
    user_id = result[0]["id"]
    print(f"{Fore.GREEN}✅ Utilisateur créé (ID: {user_id}){Style.RESET_ALL}")
    
    # Créer pilier Strava
    query_strava = """
        INSERT INTO pilier (id_utilisateur, nom_pilier, source_externe, pilier_actif, 
                           type_validation, objectif_config, access_token, refresh_token, token_expires_at)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
        RETURNING id_pilier
    """
    result_strava = db.execute(
        query_strava,
        (user_id, "Sport", "strava", True, "duree", 
         json.dumps({"duree_minutes": 30}),
         "fake_strava_token", "fake_strava_refresh",
         int((datetime.now() + timedelta(hours=6)).timestamp())),
        fetch=True
    )
    pilier_strava_id = result_strava[0]["id_pilier"] if result_strava else None
    
    # Créer pilier Spotify
    query_spotify = """
        INSERT INTO pilier (id_utilisateur, nom_pilier, source_externe, pilier_actif, 
                           type_validation, objectif_config, access_token, refresh_token, token_expires_at)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
        RETURNING id_pilier
    """
    result_spotify = db.execute(
        query_spotify,
        (user_id, "Culture", "spotify", True, "duree",
         json.dumps({"duree_minutes": 20}),
         "fake_spotify_token", "fake_spotify_refresh",
         int((datetime.now() + timedelta(hours=6)).timestamp())),
        fetch=True
    )
    pilier_spotify_id = result_spotify[0]["id_pilier"] if result_spotify else None
    
    print(f"{Fore.GREEN}✅ Piliers créés (Strava: {pilier_strava_id}, Spotify: {pilier_spotify_id}){Style.RESET_ALL}\n")
    
    return user_id, pilier_strava_id, pilier_spotify_id

def cleanup_test_user(db, user_id):
    """Supprimer l'utilisateur test"""
    print(f"\n{Fore.CYAN}🧹 CLEANUP : Suppression utilisateur test{Style.RESET_ALL}")
    print("-" * 70)
    
    queries = [
        ("piliers", f"DELETE FROM pilier WHERE id_utilisateur = {user_id}"),
        ("utilisateur", f"DELETE FROM utilisateur WHERE id = {user_id}")
    ]
    
    for name, query in queries:
        if db.execute(query):
            print(f"{Fore.GREEN}✅ {name} supprimés{Style.RESET_ALL}")
    
    print(f"{Fore.GREEN}✅ Cleanup terminé{Style.RESET_ALL}\n")

# ====================================
# TESTS GROUPE 1 : Structure Piliers
# ====================================

def test_group_1_structure_piliers(result, db, user_id, pilier_strava_id, pilier_spotify_id):
    """GROUPE 1 : Tests structure piliers en BDD"""
    print(f"\n{Fore.CYAN}📋 GROUPE 1 : Structure Piliers{Style.RESET_ALL}")
    print("-" * 70)
    
    # Test 1.1 : 2 piliers créés
    print("\n🧪 Test 1.1 : 2 piliers créés pour l'utilisateur")
    
    query = """
        SELECT COUNT(*) as count
        FROM pilier
        WHERE id_utilisateur = %s
    """
    piliers = db.execute(query, (user_id,), fetch=True)
    nb_piliers = piliers[0]["count"] if piliers else 0
    
    result.add_test(
        "Test 1.1 - 2 piliers en BDD",
        nb_piliers == 2,
        f"Attendu: 2, Reçu: {nb_piliers}"
    )
    
    # Test 1.2 : Pilier Strava bien configuré
    print("\n🧪 Test 1.2 : Pilier Strava bien configuré")
    
    query_strava = """
        SELECT nom_pilier, source_externe, pilier_actif, type_validation, objectif_config
        FROM pilier
        WHERE id_pilier = %s
    """
    strava_data = db.execute(query_strava, (pilier_strava_id,), fetch=True)
    
    if strava_data:
        strava = strava_data[0]
        
        result.add_test(
            "Test 1.2a - Nom pilier = 'Sport'",
            strava["nom_pilier"] == "Sport",
            f"Attendu: Sport, Reçu: {strava['nom_pilier']}"
        )
        result.add_test(
            "Test 1.2b - Source = 'strava'",
            strava["source_externe"] == "strava",
            f"Attendu: strava, Reçu: {strava['source_externe']}"
        )
        result.add_test(
            "Test 1.2c - Pilier actif",
            strava["pilier_actif"] == True,
            f"Pilier inactif"
        )
        
        # Vérifier objectif_config
        try:
            config = json.loads(strava["objectif_config"]) if isinstance(strava["objectif_config"], str) else strava["objectif_config"]
            result.add_test(
                "Test 1.2d - Objectif = 30 min",
                config.get("duree_minutes") == 30,
                f"Attendu: 30, Reçu: {config.get('duree_minutes')}"
            )
        except:
            result.add_test("Test 1.2d - Objectif invalide", False)
    else:
        result.add_test("Test 1.2 - Pilier Strava non trouvé", False)
    
    # Test 1.3 : Pilier Spotify bien configuré
    print("\n🧪 Test 1.3 : Pilier Spotify bien configuré")
    
    query_spotify = """
        SELECT nom_pilier, source_externe, pilier_actif, type_validation, objectif_config
        FROM pilier
        WHERE id_pilier = %s
    """
    spotify_data = db.execute(query_spotify, (pilier_spotify_id,), fetch=True)
    
    if spotify_data:
        spotify = spotify_data[0]
        
        result.add_test(
            "Test 1.3a - Nom pilier = 'Culture'",
            spotify["nom_pilier"] == "Culture",
            f"Attendu: Culture, Reçu: {spotify['nom_pilier']}"
        )
        result.add_test(
            "Test 1.3b - Source = 'spotify'",
            spotify["source_externe"] == "spotify",
            f"Attendu: spotify, Reçu: {spotify['source_externe']}"
        )
        result.add_test(
            "Test 1.3c - Pilier actif",
            spotify["pilier_actif"] == True,
            f"Pilier inactif"
        )
        
        # Vérifier objectif_config
        try:
            config = json.loads(spotify["objectif_config"]) if isinstance(spotify["objectif_config"], str) else spotify["objectif_config"]
            result.add_test(
                "Test 1.3d - Objectif = 20 min",
                config.get("duree_minutes") == 20,
                f"Attendu: 20, Reçu: {config.get('duree_minutes')}"
            )
        except:
            result.add_test("Test 1.3d - Objectif invalide", False)
    else:
        result.add_test("Test 1.3 - Pilier Spotify non trouvé", False)

# ====================================
# TESTS GROUPE 2 : Tokens OAuth
# ====================================

def test_group_2_tokens_oauth(result, db, pilier_strava_id, pilier_spotify_id):
    """GROUPE 2 : Tests tokens OAuth"""
    print(f"\n{Fore.CYAN}📋 GROUPE 2 : Tokens OAuth{Style.RESET_ALL}")
    print("-" * 70)
    
    # Test 2.1 : Tokens Strava présents
    print("\n🧪 Test 2.1 : Tokens Strava stockés")
    
    query = """
        SELECT access_token, refresh_token, token_expires_at
        FROM pilier
        WHERE id_pilier = %s
    """
    tokens = db.execute(query, (pilier_strava_id,), fetch=True)
    
    if tokens:
        token_data = tokens[0]
        
        result.add_test(
            "Test 2.1a - access_token présent",
            token_data["access_token"] is not None,
            "access_token NULL"
        )
        result.add_test(
            "Test 2.1b - refresh_token présent",
            token_data["refresh_token"] is not None,
            "refresh_token NULL"
        )
        result.add_test(
            "Test 2.1c - token_expires_at présent",
            token_data["token_expires_at"] is not None,
            "token_expires_at NULL"
        )
    else:
        result.add_test("Test 2.1 - Pilier non trouvé", False)
    
    # Test 2.2 : Tokens Spotify présents
    print("\n🧪 Test 2.2 : Tokens Spotify stockés")
    
    tokens_spotify = db.execute(query, (pilier_spotify_id,), fetch=True)
    
    if tokens_spotify:
        token_data = tokens_spotify[0]
        
        result.add_test(
            "Test 2.2a - access_token présent",
            token_data["access_token"] is not None,
            "access_token NULL"
        )
        result.add_test(
            "Test 2.2b - refresh_token présent",
            token_data["refresh_token"] is not None,
            "refresh_token NULL"
        )
        result.add_test(
            "Test 2.2c - token_expires_at présent",
            token_data["token_expires_at"] is not None,
            "token_expires_at NULL"
        )
    else:
        result.add_test("Test 2.2 - Pilier non trouvé", False)

# ====================================
# TESTS GROUPE 3 : Intégrité BDD
# ====================================

def test_group_3_integrite_bdd(result, db, user_id):
    """GROUPE 3 : Tests intégrité BDD"""
    print(f"\n{Fore.CYAN}📋 GROUPE 3 : Intégrité BDD{Style.RESET_ALL}")
    print("-" * 70)
    
    # Test 3.1 : Clé étrangère piliers → utilisateur
    print("\n🧪 Test 3.1 : Relation piliers → utilisateur")
    
    query_orphan = """
        SELECT COUNT(*) as count
        FROM pilier
        WHERE id_utilisateur NOT IN (SELECT id FROM utilisateur)
    """
    orphans = db.execute(query_orphan, fetch=True)
    nb_orphans = orphans[0]["count"] if orphans else 0
    
    result.add_test(
        "Test 3.1 - Aucun pilier orphelin",
        nb_orphans == 0,
        f"Piliers orphelins: {nb_orphans}"
    )
    
    # Test 3.2 : Types de validation valides
    print("\n🧪 Test 3.2 : Types de validation cohérents")
    
    query_validation_types = """
        SELECT type_validation
        FROM pilier
        WHERE id_utilisateur = %s
    """
    types = db.execute(query_validation_types, (user_id,), fetch=True)
    
    valid_types = all(t["type_validation"] in ["duree", "nombre", "completion"] for t in types)
    
    result.add_test(
        "Test 3.2 - Types validation valides",
        valid_types,
        "Type validation invalide détecté"
    )

# ====================================
# MAIN
# ====================================

def main():
    print(f"\n{Fore.CYAN}{'='*70}{Style.RESET_ALL}")
    print(f"{Fore.CYAN}🧪 SCRIPT DE TESTS AUTOMATISÉS - CARTE 2 : SYNCHRONISATION{Style.RESET_ALL}")
    print(f"{Fore.CYAN}{'='*70}{Style.RESET_ALL}\n")
    
    result = TestResult()
    
    # Connexion BDD
    print(f"{Fore.YELLOW}📡 Connexion à la base de données...{Style.RESET_ALL}")
    db = DatabaseHelper(DB_CONFIG)
    
    if not db.connect():
        print(f"{Fore.RED}❌ Impossible de se connecter à la BDD{Style.RESET_ALL}")
        return
    
    print(f"{Fore.GREEN}✅ Connecté à PostgreSQL{Style.RESET_ALL}\n")
    
    # Setup
    user_id, pilier_strava_id, pilier_spotify_id = setup_test_user(db)
    
    if not user_id:
        print(f"{Fore.RED}❌ Échec du setup{Style.RESET_ALL}")
        db.close()
        return
    
    try:
        # Exécuter tous les groupes de tests
        test_group_1_structure_piliers(result, db, user_id, pilier_strava_id, pilier_spotify_id)
        test_group_2_tokens_oauth(result, db, pilier_strava_id, pilier_spotify_id)
        test_group_3_integrite_bdd(result, db, user_id)
        
    finally:
        # Cleanup
        cleanup_test_user(db, user_id)
        db.close()
    
    # Afficher le résumé
    result.print_summary()

if __name__ == "__main__":
    main()