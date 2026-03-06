#!/usr/bin/env python3
"""
Script de tests automatisés - CARTE 1 : Inscription & Connexion
Tests complets du système d'authentification
"""

import requests
import psycopg2
from psycopg2.extras import RealDictCursor
from datetime import datetime
import time
from colorama import Fore, Style, init

# Initialiser colorama
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
        print(f"{Fore.CYAN}📊 RÉSUMÉ DES TESTS - CARTE 1{Style.RESET_ALL}")
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
# CLEANUP
# ====================================

def cleanup_test_users(db):
    """Supprimer tous les utilisateurs de test"""
    print(f"\n{Fore.CYAN}🧹 CLEANUP : Suppression utilisateurs test précédents{Style.RESET_ALL}")
    print("-" * 70)
    
    query = "DELETE FROM utilisateur WHERE email LIKE 'test.carte1.%@levly.com'"
    if db.execute(query):
        print(f"{Fore.GREEN}✅ Utilisateurs test supprimés{Style.RESET_ALL}\n")

# ====================================
# TESTS GROUPE 1 : Inscription Backend
# ====================================

def test_group_1_inscription_backend(result, api_url, db):
    """GROUPE 1 : Tests inscription via API backend"""
    print(f"\n{Fore.CYAN}📋 GROUPE 1 : Inscription Backend{Style.RESET_ALL}")
    print("-" * 70)
    
    # Test 1.1 : Inscription valide
    print("\n🧪 Test 1.1 : Inscription valide")
    timestamp = int(time.time())
    email_test = f"test.carte1.{timestamp}@levly.com"
    
    user_data = {
        "prenom": "Test",
        "nom": "Carte1",
        "date_de_naissance": "1990-01-01",
        "email": email_test,
        "mot_de_passe": "TestCarte1123"
    }
    
    response = requests.post(f"{api_url}/auth/register", json=user_data)
    
    if response.status_code == 201:
        data = response.json()
        
        result.add_test(
            "Test 1.1a - Status 201 Created",
            True
        )
        result.add_test(
            "Test 1.1b - Token présent",
            "token" in data,
            f"Token manquant dans réponse"
        )
        result.add_test(
            "Test 1.1c - User créé avec bon email",
            data.get("user", {}).get("email") == email_test,
            f"Email attendu: {email_test}, reçu: {data.get('user', {}).get('email')}"
        )
        
        # Sauvegarder pour tests suivants
        global saved_email, saved_password, saved_token
        saved_email = email_test
        saved_password = "TestCarte1123"
        saved_token = data.get("token")
        
    else:
        result.add_test("Test 1.1 - ÉCHEC", False, f"Status: {response.status_code}")
    
    time.sleep(1)
    
    # Test 1.2 : Email déjà utilisé
    print("\n🧪 Test 1.2 : Email déjà utilisé")
    response = requests.post(f"{api_url}/auth/register", json=user_data)
    
    result.add_test(
        "Test 1.2 - Status 400 Bad Request",
        response.status_code == 400,
        f"Attendu: 400, Reçu: {response.status_code}"
    )
    
    time.sleep(1)
    
    # Test 1.3 : Champ prenom manquant
    print("\n🧪 Test 1.3 : Champ 'prenom' manquant")
    invalid_data = {
        "nom": "Carte1",
        "date_de_naissance": "1990-01-01",
        "email": f"test.carte1.invalid1.{timestamp}@levly.com",
        "mot_de_passe": "TestCarte1123"
    }
    
    response = requests.post(f"{api_url}/auth/register", json=invalid_data)
    
    result.add_test(
        "Test 1.3 - Status 400 Bad Request",
        response.status_code == 400,
        f"Attendu: 400, Reçu: {response.status_code}"
    )
    
    time.sleep(1)
    
    # Test 1.4 : Champ email manquant
    print("\n🧪 Test 1.4 : Champ 'email' manquant")
    invalid_data = {
        "prenom": "Test",
        "nom": "Carte1",
        "date_de_naissance": "1990-01-01",
        "mot_de_passe": "TestCarte1123"
    }
    
    response = requests.post(f"{api_url}/auth/register", json=invalid_data)
    
    result.add_test(
        "Test 1.4 - Status 400 Bad Request",
        response.status_code == 400,
        f"Attendu: 400, Reçu: {response.status_code}"
    )
    
    time.sleep(1)
    
    # Test 1.5 : Champ mot_de_passe manquant
    print("\n🧪 Test 1.5 : Champ 'mot_de_passe' manquant")
    invalid_data = {
        "prenom": "Test",
        "nom": "Carte1",
        "date_de_naissance": "1990-01-01",
        "email": f"test.carte1.invalid2.{timestamp}@levly.com"
    }
    
    response = requests.post(f"{api_url}/auth/register", json=invalid_data)
    
    result.add_test(
        "Test 1.5 - Status 400 Bad Request",
        response.status_code == 400,
        f"Attendu: 400, Reçu: {response.status_code}"
    )

# ====================================
# TESTS GROUPE 2 : Connexion Backend
# ====================================

def test_group_2_connexion_backend(result, api_url, db):
    """GROUPE 2 : Tests connexion via API backend"""
    print(f"\n{Fore.CYAN}📋 GROUPE 2 : Connexion Backend{Style.RESET_ALL}")
    print("-" * 70)
    
    # Test 2.1 : Connexion valide
    print("\n🧪 Test 2.1 : Connexion valide")
    login_data = {
        "email": saved_email,
        "mot_de_passe": saved_password
    }
    
    response = requests.post(f"{api_url}/auth/login", json=login_data)
    
    if response.status_code == 200:
        data = response.json()
        
        result.add_test(
            "Test 2.1a - Status 200 OK",
            True
        )
        result.add_test(
            "Test 2.1b - Token présent",
            "token" in data,
            "Token manquant dans réponse"
        )
    else:
        result.add_test("Test 2.1 - ÉCHEC", False, f"Status: {response.status_code}")
    
    time.sleep(1)
    
    # Test 2.2 : Mauvais mot de passe
    print("\n🧪 Test 2.2 : Mauvais mot de passe")
    wrong_data = {
        "email": saved_email,
        "mot_de_passe": "MauvaisMotDePasse123"
    }
    
    response = requests.post(f"{api_url}/auth/login", json=wrong_data)
    
    result.add_test(
        "Test 2.2 - Status 401 Unauthorized",
        response.status_code == 401,
        f"Attendu: 401, Reçu: {response.status_code}"
    )
    
    time.sleep(1)
    
    # Test 2.3 : Email inexistant
    print("\n🧪 Test 2.3 : Email inexistant")
    wrong_data = {
        "email": "email.inexistant@levly.com",
        "mot_de_passe": "MotDePasse123"
    }
    
    response = requests.post(f"{api_url}/auth/login", json=wrong_data)
    
    result.add_test(
        "Test 2.3 - Status 401 Unauthorized",
        response.status_code == 401,
        f"Attendu: 401, Reçu: {response.status_code}"
    )
    
    time.sleep(1)
    
    # Test 2.4 : Champ mot_de_passe manquant
    print("\n🧪 Test 2.4 : Champ 'mot_de_passe' manquant")
    invalid_data = {
        "email": saved_email
    }
    
    response = requests.post(f"{api_url}/auth/login", json=invalid_data)
    
    result.add_test(
        "Test 2.4 - Status 400 Bad Request",
        response.status_code == 400,
        f"Attendu: 400, Reçu: {response.status_code}"
    )

# ====================================
# TESTS GROUPE 3 : Sécurité
# ====================================

def test_group_3_securite(result, api_url, db):
    """GROUPE 3 : Tests sécurité"""
    print(f"\n{Fore.CYAN}📋 GROUPE 3 : Sécurité{Style.RESET_ALL}")
    print("-" * 70)
    
    # Test 3.1 : Mot de passe haché en BDD
    print("\n🧪 Test 3.1 : Mot de passe haché en BDD")
    
    query = "SELECT mot_de_passe FROM utilisateur WHERE email = %s"
    result_db = db.execute(query, (saved_email,), fetch=True)
    
    if result_db:
        hashed_password = result_db[0]["mot_de_passe"]
        
        # Vérifier que le mot de passe n'est PAS stocké en clair
        is_hashed = hashed_password != saved_password and len(hashed_password) > 50
        
        result.add_test(
            "Test 3.1 - Mot de passe haché (bcrypt)",
            is_hashed,
            f"Mot de passe semble en clair: {hashed_password[:20]}..."
        )
    else:
        result.add_test("Test 3.1 - User non trouvé en BDD", False)
    
    # Test 3.2 : Token JWT valide
    print("\n🧪 Test 3.2 : Token JWT valide")
    
    # Un token JWT a 3 parties séparées par des points
    is_jwt_format = saved_token and saved_token.count('.') == 2
    
    result.add_test(
        "Test 3.2 - Format JWT valide (3 parties)",
        is_jwt_format,
        f"Token: {saved_token[:30] if saved_token else 'None'}..."
    )
    
    # Test 3.3 : Route protégée avec token valide
    print("\n🧪 Test 3.3 : Route protégée avec token valide")
    
    headers = {"Authorization": f"Bearer {saved_token}"}
    response = requests.get(f"{api_url}/validation/recovery", headers=headers, json={"timezone": "Europe/Paris"})
    
    result.add_test(
        "Test 3.3 - Accès autorisé avec token",
        response.status_code in [200, 404],  # 200 ou 404 si pas d'activités
        f"Status: {response.status_code}"
    )
    
    time.sleep(1)
    
    # Test 3.4 : Route protégée SANS token
    print("\n🧪 Test 3.4 : Route protégée SANS token")
    
    response = requests.get(f"{api_url}/validation/recovery", json={"timezone": "Europe/Paris"})
    
    result.add_test(
        "Test 3.4 - Accès refusé sans token (401)",
        response.status_code == 401,
        f"Attendu: 401, Reçu: {response.status_code}"
    )

# ====================================
# MAIN
# ====================================

def main():
    print(f"\n{Fore.CYAN}{'='*70}{Style.RESET_ALL}")
    print(f"{Fore.CYAN}🧪 SCRIPT DE TESTS AUTOMATISÉS - CARTE 1 : INSCRIPTION & CONNEXION{Style.RESET_ALL}")
    print(f"{Fore.CYAN}{'='*70}{Style.RESET_ALL}\n")
    
    result = TestResult()
    
    # Connexion BDD
    print(f"{Fore.YELLOW}📡 Connexion à la base de données...{Style.RESET_ALL}")
    db = DatabaseHelper(DB_CONFIG)
    
    if not db.connect():
        print(f"{Fore.RED}❌ Impossible de se connecter à la BDD{Style.RESET_ALL}")
        return
    
    print(f"{Fore.GREEN}✅ Connecté à PostgreSQL{Style.RESET_ALL}\n")
    
    # Cleanup
    cleanup_test_users(db)
    
    try:
        # Variables globales pour partager entre tests
        global saved_email, saved_password, saved_token
        saved_email = None
        saved_password = None
        saved_token = None
        
        # Exécuter tous les groupes de tests
        test_group_1_inscription_backend(result, API_BASE_URL, db)
        test_group_2_connexion_backend(result, API_BASE_URL, db)
        test_group_3_securite(result, API_BASE_URL, db)
        
    finally:
        # Cleanup final
        cleanup_test_users(db)
        db.close()
    
    # Afficher le résumé
    result.print_summary()

if __name__ == "__main__":
    main()