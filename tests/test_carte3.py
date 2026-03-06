#!/usr/bin/env python3
"""
Script de tests automatisés - CARTE 3 : Validation Quotidienne
Tests complets du système de validation avec Strava/Spotify
"""

import requests
import psycopg2
from psycopg2.extras import RealDictCursor
from datetime import datetime, timedelta
import json
from colorama import Fore, Style, init
import time

# Initialiser colorama pour les couleurs
init(autoreset=True)

# ====================================
# CONFIGURATION
# ====================================

# URL de l'API
API_BASE_URL = "https://nonintersecting-loretta-cleansingly.ngrok-free.dev/api"

# Configuration BDD PostgreSQL
DB_CONFIG = {
    "host": "localhost",
    "database": "levly_db",
    "user": "gregory",
    "password": "password123",
    "port": 5432
}

# Données de test
# Données de test avec timestamp unique
TEST_USER = {
    "prenom": "Test",
    "nom": "Validation",
    "date_de_naissance": "1990-01-01",
    "email": f"test.validation.{int(time.time())}@levly.com",  # Email unique
    "mot_de_passe": "TestValidation123"
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
        print(f"{Fore.CYAN}📊 RÉSUMÉ DES TESTS - CARTE 3{Style.RESET_ALL}")
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
        """Connexion à la BDD"""
        try:
            self.conn = psycopg2.connect(**self.config, cursor_factory=RealDictCursor)
            return True
        except Exception as e:
            print(f"{Fore.RED}❌ Erreur connexion BDD: {e}{Style.RESET_ALL}")
            return False
    
    def execute(self, query, params=None, fetch=False):
        """Exécuter une requête SQL"""
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
        """Fermer la connexion"""
        if self.conn:
            self.conn.close()

# ====================================
# SETUP & CLEANUP
# ====================================

def setup_test_data(db, api_url):
    """
    Créer toutes les données de test nécessaires
    Retourne: user_id, token, pilier_strava_id, pilier_spotify_id
    """
    print(f"\n{Fore.CYAN}🔧 SETUP : Création des données de test{Style.RESET_ALL}")
    print("-" * 70)
    
    # 1. Créer l'utilisateur
    print("📝 Création utilisateur test...")
    response = requests.post(
        f"{api_url}/auth/register",
        json=TEST_USER
    )
    
    if response.status_code != 201:
        print(f"{Fore.RED}❌ Impossible de créer l'utilisateur{Style.RESET_ALL}")
        return None
    
    data = response.json()
    user_id = data["user"]["id"]
    token = data["token"]
    print(f"{Fore.GREEN}✅ Utilisateur créé (ID: {user_id}){Style.RESET_ALL}")
    
    # 2. Créer les piliers Strava et Spotify
    print("📝 Création piliers Strava et Spotify...")
    
    # Pilier Strava
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
    
    # Pilier Spotify
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
    
    print(f"{Fore.GREEN}✅ Piliers créés (Strava: {pilier_strava_id}, Spotify: {pilier_spotify_id}){Style.RESET_ALL}")
    
    # 3. Créer la série à 0
    print("📝 Création série initiale...")
    query_serie = """
        INSERT INTO serie (id_utilisateur, serie_actuelle, date_maj)
        VALUES (%s, 0, CURRENT_TIMESTAMP)
    """
    db.execute(query_serie, (user_id,))
    print(f"{Fore.GREEN}✅ Série initialisée{Style.RESET_ALL}")
    
    # 4. Initialiser tokens à 0
    print("📝 Initialisation tokens...")
    query_tokens = """
        INSERT INTO jeton (id_utilisateur, montant_jeton, origine_jeton)
        VALUES (%s, 0, 'initialisation')
    """
    db.execute(query_tokens, (user_id,))
    print(f"{Fore.GREEN}✅ Tokens initialisés{Style.RESET_ALL}")
    
    print(f"{Fore.GREEN}✅ Setup terminé avec succès{Style.RESET_ALL}\n")
    
    return {
        "user_id": user_id,
        "token": token,
        "pilier_strava_id": pilier_strava_id,
        "pilier_spotify_id": pilier_spotify_id
    }

def cleanup_test_data(db, user_id):
    """Supprimer toutes les données de test"""
    print(f"\n{Fore.CYAN}🧹 CLEANUP : Suppression des données de test{Style.RESET_ALL}")
    print("-" * 70)
    
    # Supprimer dans l'ordre (clés étrangères)
    queries = [
        ("activites", f"DELETE FROM activite WHERE id_utilisateur = {user_id}"),
        ("jetons", f"DELETE FROM jeton WHERE id_utilisateur = {user_id}"),
        ("series", f"DELETE FROM serie WHERE id_utilisateur = {user_id}"),
        ("piliers", f"DELETE FROM pilier WHERE id_utilisateur = {user_id}"),
        ("utilisateur", f"DELETE FROM utilisateur WHERE id = {user_id}")
    ]
    
    for name, query in queries:
        if db.execute(query):
            print(f"{Fore.GREEN}✅ {name} supprimés{Style.RESET_ALL}")
        else:
            print(f"{Fore.RED}❌ Erreur suppression {name}{Style.RESET_ALL}")
    
    print(f"{Fore.GREEN}✅ Cleanup terminé{Style.RESET_ALL}\n")

# ====================================
# FONCTIONS DE TESTS
# ====================================

def create_fake_activities(db, user_id, pilier_strava_id, pilier_spotify_id, 
                          strava_minutes=0, spotify_minutes=0, date=None):
    """
    Créer des activités factices en BDD pour simuler Strava/Spotify
    """
    if date is None:
        date = datetime.now().date()
    
    # Activité Strava
    if strava_minutes > 0:
        query_strava = """
            INSERT INTO activite (id_utilisateur, id_pilier, date_activite, 
                                 duree_minutes, source_externe, activite_validee)
            VALUES (%s, %s, %s, %s, %s, %s)
            ON CONFLICT (id_utilisateur, id_pilier, date_activite) 
            DO UPDATE SET duree_minutes = EXCLUDED.duree_minutes,
                         activite_validee = EXCLUDED.activite_validee
        """
        db.execute(query_strava, (
            user_id, pilier_strava_id, date, strava_minutes, 
            "strava", strava_minutes >= 30
        ))
    
    # Activité Spotify
    if spotify_minutes > 0:
        query_spotify = """
            INSERT INTO activite (id_utilisateur, id_pilier, date_activite, 
                                 duree_minutes, source_externe, activite_validee)
            VALUES (%s, %s, %s, %s, %s, %s)
            ON CONFLICT (id_utilisateur, id_pilier, date_activite)
            DO UPDATE SET duree_minutes = EXCLUDED.duree_minutes,
                         activite_validee = EXCLUDED.activite_validee
        """
        db.execute(query_spotify, (
            user_id, pilier_spotify_id, date, spotify_minutes,
            "spotify", spotify_minutes >= 20
        ))

def delete_today_activities(db, user_id):
    """Supprimer les activités du jour"""
    query = """
        DELETE FROM activite 
        WHERE id_utilisateur = %s 
        AND date_activite = CURRENT_DATE
    """
    db.execute(query, (user_id,))

def get_user_tokens(db, user_id):
    """Récupérer le solde tokens total"""
    query = """
        SELECT COALESCE(SUM(montant_jeton), 0) as total
        FROM jeton
        WHERE id_utilisateur = %s
    """
    result = db.execute(query, (user_id,), fetch=True)
    return result[0]["total"] if result else 0

def get_user_serie(db, user_id):
    """Récupérer la série actuelle"""
    query = """
        SELECT serie_actuelle
        FROM serie
        WHERE id_utilisateur = %s
    """
    result = db.execute(query, (user_id,), fetch=True)
    return result[0]["serie_actuelle"] if result else 0

def call_validation_api(api_url, token):
    """Appeler l'API de validation"""
    response = requests.post(
        f"{api_url}/validation/recovery",
        headers={"Authorization": f"Bearer {token}"},
        json={"timezone": "Europe/Paris"}
    )
    return response

# ====================================
# TESTS GROUPE 1 : Validation 2/2 piliers
# ====================================

def test_group_1_validation_complete(result, db, api_url, test_data):
    """GROUPE 1 : Tests validation complète (2/2 piliers)"""
    print(f"\n{Fore.CYAN}📋 GROUPE 1 : Validation Complète (2/2 piliers){Style.RESET_ALL}")
    print("-" * 70)
    
    user_id = test_data["user_id"]
    token = test_data["token"]
    pilier_strava_id = test_data["pilier_strava_id"]
    pilier_spotify_id = test_data["pilier_spotify_id"]
    
    # Test 1.1 : Première validation 2/2 piliers
    print("\n🧪 Test 1.1 : Première validation 2/2 piliers")
    delete_today_activities(db, user_id)
    create_fake_activities(db, user_id, pilier_strava_id, pilier_spotify_id, 
                          strava_minutes=45, spotify_minutes=30)
    
    tokens_before = get_user_tokens(db, user_id)
    serie_before = get_user_serie(db, user_id)
    
    response = call_validation_api(api_url, token)
    
    if response.status_code == 200:
        data = response.json()["data"]
        tokens_after = get_user_tokens(db, user_id)
        serie_after = get_user_serie(db, user_id)
        
        # Vérifications
        result.add_test(
            "Test 1.1a - Status 200 OK",
            True
        )
        result.add_test(
            "Test 1.1b - 2/2 piliers validés",
            data["piliers_valides"] == 2,
            f"Attendu: 2, Reçu: {data['piliers_valides']}"
        )
        result.add_test(
            "Test 1.1c - +10 tokens gagnés",
            data["tokens_gagnes"] == 10,
            f"Attendu: 10, Reçu: {data['tokens_gagnes']}"
        )
        result.add_test(
            "Test 1.1d - Série +1",
            serie_after == serie_before + 1,
            f"Attendu: {serie_before + 1}, Reçu: {serie_after}"
        )
        result.add_test(
            "Test 1.1e - Solde tokens augmenté",
            tokens_after == tokens_before + 10,
            f"Attendu: {tokens_before + 10}, Reçu: {tokens_after}"
        )
    else:
        result.add_test("Test 1.1 - ÉCHEC COMPLET", False, 
                       f"Status: {response.status_code}")
    
    time.sleep(1)
    
    # Test 1.2 : Deuxième validation même jour (pas de nouveaux tokens)
    print("\n🧪 Test 1.2 : Deuxième validation même jour")
    tokens_before = get_user_tokens(db, user_id)
    serie_before = get_user_serie(db, user_id)
    
    response = call_validation_api(api_url, token)
    
    if response.status_code == 200:
        data = response.json()["data"]
        tokens_after = get_user_tokens(db, user_id)
        serie_after = get_user_serie(db, user_id)
        
        result.add_test(
            "Test 1.2a - 0 nouveaux tokens",
            data["tokens_gagnes"] == 0,
            f"Attendu: 0, Reçu: {data['tokens_gagnes']}"
        )
        result.add_test(
            "Test 1.2b - Série inchangée",
            serie_after == serie_before,
            f"Attendu: {serie_before}, Reçu: {serie_after}"
        )
        result.add_test(
            "Test 1.2c - Solde inchangé",
            tokens_after == tokens_before,
            f"Attendu: {tokens_before}, Reçu: {tokens_after}"
        )
    else:
        result.add_test("Test 1.2 - ÉCHEC", False, f"Status: {response.status_code}")

# ====================================
# TESTS GROUPE 2 : Validation 1/2 piliers
# ====================================

def test_group_2_validation_partielle(result, db, api_url, test_data):
    """GROUPE 2 : Tests validation partielle (1/2 piliers)"""
    print(f"\n{Fore.CYAN}📋 GROUPE 2 : Validation Partielle (1/2 piliers){Style.RESET_ALL}")
    print("-" * 70)
    
    user_id = test_data["user_id"]
    token = test_data["token"]
    pilier_strava_id = test_data["pilier_strava_id"]
    pilier_spotify_id = test_data["pilier_spotify_id"]
    
    # Test 2.1 : Validation Spotify uniquement
    print("\n🧪 Test 2.1 : Validation Spotify uniquement")
    delete_today_activities(db, user_id)
    create_fake_activities(db, user_id, pilier_strava_id, pilier_spotify_id,
                          strava_minutes=0, spotify_minutes=30)
    
    tokens_before = get_user_tokens(db, user_id)
    serie_before = get_user_serie(db, user_id)
    
    response = call_validation_api(api_url, token)
    
    if response.status_code == 200:
        data = response.json()["data"]
        tokens_after = get_user_tokens(db, user_id)
        serie_after = get_user_serie(db, user_id)
        
        result.add_test(
            "Test 2.1a - 1/2 piliers validés",
            data["piliers_valides"] == 1,
            f"Attendu: 1, Reçu: {data['piliers_valides']}"
        )
        result.add_test(
            "Test 2.1b - +5 tokens",
            data["tokens_gagnes"] == 5,
            f"Attendu: 5, Reçu: {data['tokens_gagnes']}"
        )
        result.add_test(
            "Test 2.1c - Série +1",
            serie_after == serie_before + 1,
            f"Attendu: {serie_before + 1}, Reçu: {serie_after}"
        )
    else:
        result.add_test("Test 2.1 - ÉCHEC", False, f"Status: {response.status_code}")
    
    time.sleep(1)
    
    # Test 2.2 : Validation Strava uniquement
    print("\n🧪 Test 2.2 : Validation Strava uniquement")
    delete_today_activities(db, user_id)
    create_fake_activities(db, user_id, pilier_strava_id, pilier_spotify_id,
                          strava_minutes=45, spotify_minutes=0)
    
    tokens_before = get_user_tokens(db, user_id)
    serie_before = get_user_serie(db, user_id)
    
    response = call_validation_api(api_url, token)
    
    if response.status_code == 200:
        data = response.json()["data"]
        tokens_after = get_user_tokens(db, user_id)
        serie_after = get_user_serie(db, user_id)
        
        result.add_test(
            "Test 2.2a - 1/2 piliers validés",
            data["piliers_valides"] == 1,
            f"Attendu: 1, Reçu: {data['piliers_valides']}"
        )
        result.add_test(
            "Test 2.2b - +5 tokens",
            data["tokens_gagnes"] == 5,
            f"Attendu: 5, Reçu: {data['tokens_gagnes']}"
        )
        result.add_test(
            "Test 2.2c - Série +1",
            serie_after == serie_before + 1,
            f"Attendu: {serie_before + 1}, Reçu: {serie_after}"
        )
    else:
        result.add_test("Test 2.2 - ÉCHEC", False, f"Status: {response.status_code}")
    
    time.sleep(1)
    
    # Test 2.3 : Validation progressive (1/2 puis 2/2)
    print("\n🧪 Test 2.3 : Validation progressive")
    delete_today_activities(db, user_id)
    
    # Première validation : 1/2
    create_fake_activities(db, user_id, pilier_strava_id, pilier_spotify_id,
                          strava_minutes=0, spotify_minutes=30)
    tokens_before = get_user_tokens(db, user_id)
    
    response1 = call_validation_api(api_url, token)
    data1 = response1.json()["data"] if response1.status_code == 200 else {}
    
    time.sleep(1)
    
    # Deuxième validation : 2/2
    create_fake_activities(db, user_id, pilier_strava_id, pilier_spotify_id,
                          strava_minutes=45, spotify_minutes=30)
    
    response2 = call_validation_api(api_url, token)
    
    if response2.status_code == 200:
        data2 = response2.json()["data"]
        tokens_after = get_user_tokens(db, user_id)
        
        result.add_test(
            "Test 2.3a - Première validation +5 tokens",
            data1.get("tokens_gagnes") == 5,
            f"Attendu: 5, Reçu: {data1.get('tokens_gagnes')}"
        )
        result.add_test(
            "Test 2.3b - Deuxième validation +5 tokens",
            data2["tokens_gagnes"] == 5,
            f"Attendu: 5, Reçu: {data2['tokens_gagnes']}"
        )
        result.add_test(
            "Test 2.3c - Total +10 tokens",
            tokens_after == tokens_before + 10,
            f"Attendu: {tokens_before + 10}, Reçu: {tokens_after}"
        )
    else:
        result.add_test("Test 2.3 - ÉCHEC", False, f"Status: {response2.status_code}")

# ====================================
# TESTS GROUPE 3 : Validation 0/2 piliers
# ====================================

def test_group_3_validation_echouee(result, db, api_url, test_data):
    """GROUPE 3 : Tests validation échouée (0/2 piliers)"""
    print(f"\n{Fore.CYAN}📋 GROUPE 3 : Validation Échouée (0/2 piliers){Style.RESET_ALL}")
    print("-" * 70)
    
    user_id = test_data["user_id"]
    token = test_data["token"]
    pilier_strava_id = test_data["pilier_strava_id"]
    pilier_spotify_id = test_data["pilier_spotify_id"]
    
    # Test 3.1 : Aucune activité
    print("\n🧪 Test 3.1 : Aucune activité du tout")
    delete_today_activities(db, user_id)
    
    # Reset série à 5 pour voir le reset
    db.execute("UPDATE serie SET serie_actuelle = 5 WHERE id_utilisateur = %s", (user_id,))
    
    tokens_before = get_user_tokens(db, user_id)
    
    response = call_validation_api(api_url, token)
    
    if response.status_code == 200:
        data = response.json()["data"]
        tokens_after = get_user_tokens(db, user_id)
        serie_after = get_user_serie(db, user_id)
        
        result.add_test(
            "Test 3.1a - 0/2 piliers validés",
            data["piliers_valides"] == 0,
            f"Attendu: 0, Reçu: {data['piliers_valides']}"
        )
        result.add_test(
            "Test 3.1b - 0 tokens gagnés",
            data["tokens_gagnes"] == 0,
            f"Attendu: 0, Reçu: {data['tokens_gagnes']}"
        )
        result.add_test(
            "Test 3.1c - Série reset à 0",
            serie_after == 0,
            f"Attendu: 0, Reçu: {serie_after}"
        )
        result.add_test(
            "Test 3.1d - Solde tokens inchangé",
            tokens_after == tokens_before,
            f"Attendu: {tokens_before}, Reçu: {tokens_after}"
        )
    else:
        result.add_test("Test 3.1 - ÉCHEC", False, f"Status: {response.status_code}")
    
    time.sleep(1)
    
    # Test 3.2 : Activités présentes mais objectifs non atteints
    print("\n🧪 Test 3.2 : Activités présentes mais objectifs non atteints")
    delete_today_activities(db, user_id)
    create_fake_activities(db, user_id, pilier_strava_id, pilier_spotify_id,
                          strava_minutes=10, spotify_minutes=5)
    
    db.execute("UPDATE serie SET serie_actuelle = 3 WHERE id_utilisateur = %s", (user_id,))
    tokens_before = get_user_tokens(db, user_id)
    
    response = call_validation_api(api_url, token)
    
    if response.status_code == 200:
        data = response.json()["data"]
        serie_after = get_user_serie(db, user_id)
        
        result.add_test(
            "Test 3.2a - 0/2 piliers validés",
            data["piliers_valides"] == 0,
            f"Attendu: 0, Reçu: {data['piliers_valides']}"
        )
        result.add_test(
            "Test 3.2b - Série reset à 0",
            serie_after == 0,
            f"Attendu: 0, Reçu: {serie_after}"
        )
        result.add_test(
            "Test 3.2c - 0 tokens",
            data["tokens_gagnes"] == 0,
            f"Attendu: 0, Reçu: {data['tokens_gagnes']}"
        )
    else:
        result.add_test("Test 3.2 - ÉCHEC", False, f"Status: {response.status_code}")

# ====================================
# TESTS GROUPE 4 : Validation multiple
# ====================================

def test_group_4_validation_multiple(result, db, api_url, test_data):
    """GROUPE 4 : Tests validation multiple même jour"""
    print(f"\n{Fore.CYAN}📋 GROUPE 4 : Validation Multiple Même Jour{Style.RESET_ALL}")
    print("-" * 70)
    
    user_id = test_data["user_id"]
    token = test_data["token"]
    pilier_strava_id = test_data["pilier_strava_id"]
    pilier_spotify_id = test_data["pilier_spotify_id"]
    
    # Test 4.1 : Spam validation (5 fois de suite)
    print("\n🧪 Test 4.1 : Spam validation (5 fois)")
    delete_today_activities(db, user_id)
    create_fake_activities(db, user_id, pilier_strava_id, pilier_spotify_id,
                          strava_minutes=45, spotify_minutes=30)
    
    tokens_before = get_user_tokens(db, user_id)
    
    tokens_earned = []
    for i in range(5):
        response = call_validation_api(api_url, token)
        if response.status_code == 200:
            data = response.json()["data"]
            tokens_earned.append(data["tokens_gagnes"])
        time.sleep(0.5)
    
    tokens_after = get_user_tokens(db, user_id)
    
    result.add_test(
        "Test 4.1a - Première validation donne tokens",
        tokens_earned[0] == 10,
        f"Attendu: 10, Reçu: {tokens_earned[0]}"
    )
    result.add_test(
        "Test 4.1b - Validations suivantes donnent 0",
        all(t == 0 for t in tokens_earned[1:]),
        f"Tokens suivants: {tokens_earned[1:]}"
    )
    result.add_test(
        "Test 4.1c - Total +10 tokens seulement",
        tokens_after == tokens_before + 10,
        f"Attendu: {tokens_before + 10}, Reçu: {tokens_after}"
    )

# ====================================
# TESTS GROUPE 5 : Cohérence BDD
# ====================================

def test_group_5_coherence_bdd(result, db, api_url, test_data):
    """GROUPE 5 : Tests cohérence BDD"""
    print(f"\n{Fore.CYAN}📋 GROUPE 5 : Cohérence BDD{Style.RESET_ALL}")
    print("-" * 70)
    
    user_id = test_data["user_id"]
    token = test_data["token"]
    pilier_strava_id = test_data["pilier_strava_id"]
    pilier_spotify_id = test_data["pilier_spotify_id"]
    
    # Test 5.1 : Activités créées en BDD
    print("\n🧪 Test 5.1 : Activités créées en BDD")
    delete_today_activities(db, user_id)
    create_fake_activities(db, user_id, pilier_strava_id, pilier_spotify_id,
                          strava_minutes=45, spotify_minutes=30)
    
    response = call_validation_api(api_url, token)
    
    if response.status_code == 200:
        # Vérifier activités en BDD
        query_activities = """
            SELECT COUNT(*) as count
            FROM activite
            WHERE id_utilisateur = %s
            AND date_activite = CURRENT_DATE
        """
        activities = db.execute(query_activities, (user_id,), fetch=True)
        activity_count = activities[0]["count"] if activities else 0
        
        result.add_test(
            "Test 5.1a - 2 activités créées",
            activity_count == 2,
            f"Attendu: 2, Reçu: {activity_count}"
        )
        
        # Vérifier que les activités sont marquées validées
        query_validated = """
            SELECT COUNT(*) as count
            FROM activite
            WHERE id_utilisateur = %s
            AND date_activite = CURRENT_DATE
            AND activite_validee = true
        """
        validated = db.execute(query_validated, (user_id,), fetch=True)
        validated_count = validated[0]["count"] if validated else 0
        
        result.add_test(
            "Test 5.1b - 2 activités validées",
            validated_count == 2,
            f"Attendu: 2, Reçu: {validated_count}"
        )
    else:
        result.add_test("Test 5.1 - ÉCHEC", False, f"Status: {response.status_code}")
    
    time.sleep(1)
    
    # Test 5.2 : Pas de doublon activités
    print("\n🧪 Test 5.2 : Pas de doublon activités")
    
    # Valider 3 fois
    for i in range(3):
        call_validation_api(api_url, token)
        time.sleep(0.3)
    
    query_duplicates = """
        SELECT id_pilier, COUNT(*) as count
        FROM activite
        WHERE id_utilisateur = %s
        AND date_activite = CURRENT_DATE
        GROUP BY id_pilier
        HAVING COUNT(*) > 1
    """
    duplicates = db.execute(query_duplicates, (user_id,), fetch=True)
    
    result.add_test(
        "Test 5.2 - Pas de doublon",
        len(duplicates) == 0,
        f"Doublons trouvés: {len(duplicates)}"
    )
    
    time.sleep(1)
    
    # Test 5.3 : Tokens enregistrés correctement
    print("\n🧪 Test 5.3 : Tokens enregistrés en BDD")
    delete_today_activities(db, user_id)
    create_fake_activities(db, user_id, pilier_strava_id, pilier_spotify_id,
                          strava_minutes=45, spotify_minutes=30)
    
    tokens_before = get_user_tokens(db, user_id)
    response = call_validation_api(api_url, token)
    
    if response.status_code == 200:
        # Vérifier nouvelle ligne jeton
        query_tokens = """
            SELECT montant_jeton, origine_jeton
            FROM jeton
            WHERE id_utilisateur = %s
            ORDER BY date_creation DESC
            LIMIT 1
        """
        token_entry = db.execute(query_tokens, (user_id,), fetch=True)
        
        if token_entry:
            result.add_test(
                "Test 5.3a - Nouvelle ligne jeton créée",
                token_entry[0]["montant_jeton"] == 10,
                f"Attendu: 10, Reçu: {token_entry[0]['montant_jeton']}"
            )
            result.add_test(
                "Test 5.3b - Origine correcte",
                "validation" in token_entry[0]["origine_jeton"],
                f"Origine: {token_entry[0]['origine_jeton']}"
            )
        else:
            result.add_test("Test 5.3 - Pas de ligne jeton créée", False)
    else:
        result.add_test("Test 5.3 - ÉCHEC", False, f"Status: {response.status_code}")
    
    time.sleep(1)
    
    # Test 5.4 : Série mise à jour en BDD
    print("\n🧪 Test 5.4 : Série mise à jour en BDD")
    delete_today_activities(db, user_id)
    db.execute("UPDATE serie SET serie_actuelle = 0 WHERE id_utilisateur = %s", (user_id,))
    
    create_fake_activities(db, user_id, pilier_strava_id, pilier_spotify_id,
                          strava_minutes=45, spotify_minutes=30)
    
    response = call_validation_api(api_url, token)
    
    if response.status_code == 200:
        serie_after = get_user_serie(db, user_id)
        
        # Vérifier date_maj mise à jour
        query_date = """
            SELECT date_maj
            FROM serie
            WHERE id_utilisateur = %s
        """
        serie_data = db.execute(query_date, (user_id,), fetch=True)
        
        result.add_test(
            "Test 5.4a - Série incrémentée",
            serie_after == 1,
            f"Attendu: 1, Reçu: {serie_after}"
        )
        
        if serie_data:
            date_maj = serie_data[0]["date_maj"]
            today = datetime.now().date()
            result.add_test(
                "Test 5.4b - date_maj = aujourd'hui",
                date_maj.date() == today if hasattr(date_maj, 'date') else date_maj == today,
                f"Date maj: {date_maj}"
            )
    else:
        result.add_test("Test 5.4 - ÉCHEC", False, f"Status: {response.status_code}")

# ====================================
# TESTS GROUPE 6 : Messages & Feedback
# ====================================

def test_group_6_messages(result, db, api_url, test_data):
    """GROUPE 6 : Tests messages et feedback"""
    print(f"\n{Fore.CYAN}📋 GROUPE 6 : Messages & Feedback{Style.RESET_ALL}")
    print("-" * 70)
    
    user_id = test_data["user_id"]
    token = test_data["token"]
    pilier_strava_id = test_data["pilier_strava_id"]
    pilier_spotify_id = test_data["pilier_spotify_id"]
    
    # Test 6.1 : Message 2/2 piliers
    print("\n🧪 Test 6.1 : Message succès 2/2")
    delete_today_activities(db, user_id)
    create_fake_activities(db, user_id, pilier_strava_id, pilier_spotify_id,
                          strava_minutes=45, spotify_minutes=30)
    
    response = call_validation_api(api_url, token)
    
    if response.status_code == 200:
        data = response.json()["data"]
        message = data.get("message", "")
        
        result.add_test(
            "Test 6.1a - Message contient '2/2'",
            "2/2" in message,
            f"Message: {message}"
        )
        result.add_test(
            "Test 6.1b - Message positif",
            any(word in message.lower() for word in ["bravo", "félicitations", "excellent"]),
            f"Message: {message}"
        )
    else:
        result.add_test("Test 6.1 - ÉCHEC", False, f"Status: {response.status_code}")
    
    time.sleep(1)
    
    # Test 6.2 : Message 1/2 piliers
    print("\n🧪 Test 6.2 : Message succès 1/2")
    delete_today_activities(db, user_id)
    create_fake_activities(db, user_id, pilier_strava_id, pilier_spotify_id,
                          strava_minutes=0, spotify_minutes=30)
    
    response = call_validation_api(api_url, token)
    
    if response.status_code == 200:
        data = response.json()["data"]
        message = data.get("message", "")
        
        result.add_test(
            "Test 6.2a - Message contient '1/2'",
            "1/2" in message,
            f"Message: {message}"
        )
        result.add_test(
            "Test 6.2b - Message encourageant",
            any(word in message.lower() for word in ["bien", "joué", "continue"]),
            f"Message: {message}"
        )
    else:
        result.add_test("Test 6.2 - ÉCHEC", False, f"Status: {response.status_code}")
    
    time.sleep(1)
    
    # Test 6.3 : Message 0/2 piliers
    print("\n🧪 Test 6.3 : Message échec 0/2")
    delete_today_activities(db, user_id)
    
    response = call_validation_api(api_url, token)
    
    if response.status_code == 200:
        data = response.json()["data"]
        message = data.get("message", "")
        
        result.add_test(
            "Test 6.3a - Message contient '0' ou 'aucun'",
            "0" in message or "aucun" in message.lower(),
            f"Message: {message}"
        )
        result.add_test(
            "Test 6.3b - Message bienveillant (pas trop négatif)",
            not any(word in message.lower() for word in ["nul", "mauvais", "échec"]),
            f"Message: {message}"
        )
    else:
        result.add_test("Test 6.3 - ÉCHEC", False, f"Status: {response.status_code}")

# ====================================
# MAIN
# ====================================

def main():
    """Fonction principale"""
    print(f"\n{Fore.CYAN}{'='*70}{Style.RESET_ALL}")
    print(f"{Fore.CYAN}🧪 SCRIPT DE TESTS AUTOMATISÉS - CARTE 3 : VALIDATION QUOTIDIENNE{Style.RESET_ALL}")
    print(f"{Fore.CYAN}{'='*70}{Style.RESET_ALL}\n")
    
    # Initialiser les résultats
    result = TestResult()
    
    # Connexion BDD
    print(f"{Fore.YELLOW}📡 Connexion à la base de données...{Style.RESET_ALL}")
    db = DatabaseHelper(DB_CONFIG)
    
    if not db.connect():
        print(f"{Fore.RED}❌ Impossible de se connecter à la BDD{Style.RESET_ALL}")
        return
    
    print(f"{Fore.GREEN}✅ Connecté à PostgreSQL{Style.RESET_ALL}\n")
    
    # Setup
    test_data = setup_test_data(db, API_BASE_URL)
    
    if not test_data:
        print(f"{Fore.RED}❌ Échec du setup{Style.RESET_ALL}")
        db.close()
        return
    
    try:
        # Exécuter tous les groupes de tests
        test_group_1_validation_complete(result, db, API_BASE_URL, test_data)
        test_group_2_validation_partielle(result, db, API_BASE_URL, test_data)
        test_group_3_validation_echouee(result, db, API_BASE_URL, test_data)
        test_group_4_validation_multiple(result, db, API_BASE_URL, test_data)
        test_group_5_coherence_bdd(result, db, API_BASE_URL, test_data)
        test_group_6_messages(result, db, API_BASE_URL, test_data)
        
    finally:
        # Cleanup
        cleanup_test_data(db, test_data["user_id"])
        db.close()
    
    # Afficher le résumé
    result.print_summary()

if __name__ == "__main__":
    main()
