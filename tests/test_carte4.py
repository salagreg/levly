#!/usr/bin/env python3
"""
Script de tests automatisés - CARTE 4 : Tests Multi-jours & Série
Tests de cohérence BDD et logique série (sans dépendance APIs externes)
"""

import psycopg2
from psycopg2.extras import RealDictCursor
from datetime import datetime, timedelta
import json
from colorama import Fore, Style, init
import time

# Initialiser colorama
init(autoreset=True)

# ====================================
# CONFIGURATION
# ====================================

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
        print(f"{Fore.CYAN}📊 RÉSUMÉ DES TESTS - CARTE 4{Style.RESET_ALL}")
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
    """Créer un utilisateur test"""
    print(f"\n{Fore.CYAN}🔧 SETUP : Création utilisateur test{Style.RESET_ALL}")
    print("-" * 70)
    
    timestamp = int(time.time())
    email = f"test.carte4.{timestamp}@levly.com"
    
    query = """
        INSERT INTO utilisateur (prenom, nom, date_de_naissance, email, mot_de_passe, compte_actif)
        VALUES (%s, %s, %s, %s, %s, %s)
        RETURNING id
    """
    
    result = db.execute(
        query,
        ("Test", "Carte4", "1990-01-01", email, "hashed_password_fake", True),
        fetch=True
    )
    
    if result:
        user_id = result[0]["id"]
        print(f"{Fore.GREEN}✅ Utilisateur créé (ID: {user_id}){Style.RESET_ALL}")
        
        # Créer série initiale
        query_serie = "INSERT INTO serie (id_utilisateur, serie_actuelle, date_maj) VALUES (%s, 0, CURRENT_TIMESTAMP)"
        db.execute(query_serie, (user_id,))
        print(f"{Fore.GREEN}✅ Série initialisée{Style.RESET_ALL}\n")
        
        return user_id
    else:
        print(f"{Fore.RED}❌ Échec création utilisateur{Style.RESET_ALL}")
        return None

def cleanup_test_user(db, user_id):
    """Supprimer l'utilisateur test"""
    print(f"\n{Fore.CYAN}🧹 CLEANUP : Suppression utilisateur test{Style.RESET_ALL}")
    print("-" * 70)
    
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
    
    print(f"{Fore.GREEN}✅ Cleanup terminé{Style.RESET_ALL}\n")

def create_piliers(db, user_id):
    """Créer 2 piliers Strava et Spotify"""
    print(f"📝 Création piliers Strava et Spotify...")
    
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
         "fake_token", "fake_refresh", 
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
         "fake_token", "fake_refresh",
         int((datetime.now() + timedelta(hours=6)).timestamp())),
        fetch=True
    )
    pilier_spotify_id = result_spotify[0]["id_pilier"] if result_spotify else None
    
    print(f"{Fore.GREEN}✅ Piliers créés (Strava: {pilier_strava_id}, Spotify: {pilier_spotify_id}){Style.RESET_ALL}")
    
    return pilier_strava_id, pilier_spotify_id

# ====================================
# FONCTIONS HELPERS
# ====================================

def create_activities_for_date(db, user_id, pilier_strava_id, pilier_spotify_id, date, strava_minutes=45, spotify_minutes=30):
    """Créer des activités pour une date donnée"""
    
    # Activité Strava
    query_strava = """
        INSERT INTO activite (id_utilisateur, id_pilier, date_activite, duree_minutes, source_externe, activite_validee)
        VALUES (%s, %s, %s, %s, %s, %s)
    """
    db.execute(query_strava, (user_id, pilier_strava_id, date, strava_minutes, "strava", strava_minutes >= 30))
    
    # Activité Spotify
    query_spotify = """
        INSERT INTO activite (id_utilisateur, id_pilier, date_activite, duree_minutes, source_externe, activite_validee)
        VALUES (%s, %s, %s, %s, %s, %s)
    """
    db.execute(query_spotify, (user_id, pilier_spotify_id, date, spotify_minutes, "spotify", spotify_minutes >= 20))

def create_tokens_for_date(db, user_id, date, amount=10):
    """Créer des tokens pour une date donnée"""
    query = """
        INSERT INTO jeton (id_utilisateur, montant_jeton, origine_jeton, date_creation)
        VALUES (%s, %s, %s, %s)
    """
    # Convertir date en timestamp avec heure 12h00
    timestamp = datetime.combine(date, datetime.min.time().replace(hour=12))
    db.execute(query, (user_id, amount, "validation_complete", timestamp))

def update_serie(db, user_id, serie_value, date):
    """Mettre à jour la série avec une date spécifique"""
    timestamp = datetime.combine(date, datetime.min.time().replace(hour=12))
    query = "UPDATE serie SET serie_actuelle = %s, date_maj = %s WHERE id_utilisateur = %s"
    db.execute(query, (serie_value, timestamp, user_id))

def get_serie(db, user_id):
    """Récupérer la série actuelle"""
    query = "SELECT serie_actuelle FROM serie WHERE id_utilisateur = %s"
    result = db.execute(query, (user_id,), fetch=True)
    return result[0]["serie_actuelle"] if result else 0

# ====================================
# TESTS GROUPE 1 : Historique Multi-jours
# ====================================

def test_group_1_historique_multi_jours(result, db, user_id, pilier_strava_id, pilier_spotify_id):
    """GROUPE 1 : Tests historique activités multi-jours"""
    print(f"\n{Fore.CYAN}📋 GROUPE 1 : Historique Multi-jours{Style.RESET_ALL}")
    print("-" * 70)
    
    # Test 1.1 : Créer 7 jours d'activités
    print("\n🧪 Test 1.1 : Historique 7 jours d'activités")
    
    today = datetime.now().date()
    for i in range(7):
        date = today - timedelta(days=6-i)
        create_activities_for_date(db, user_id, pilier_strava_id, pilier_spotify_id, date)
        create_tokens_for_date(db, user_id, date)
        update_serie(db, user_id, i+1, date)
    
    # Vérifier nombre de jours
    query_dates = """
        SELECT COUNT(DISTINCT date_activite) as nb_jours
        FROM activite
        WHERE id_utilisateur = %s
    """
    dates_result = db.execute(query_dates, (user_id,), fetch=True)
    nb_jours = dates_result[0]["nb_jours"] if dates_result else 0
    
    result.add_test(
        "Test 1.1a - 7 jours distincts d'activités",
        nb_jours == 7,
        f"Attendu: 7, Reçu: {nb_jours}"
    )
    
    # Vérifier nombre d'activités par jour
    query_activities_per_day = """
        SELECT date_activite, COUNT(*) as nb_activites
        FROM activite
        WHERE id_utilisateur = %s
        GROUP BY date_activite
    """
    activities_per_day = db.execute(query_activities_per_day, (user_id,), fetch=True)
    
    all_have_2_activities = all(a["nb_activites"] == 2 for a in activities_per_day)
    
    result.add_test(
        "Test 1.1b - 2 activités par jour (Strava + Spotify)",
        all_have_2_activities,
        f"Certains jours n'ont pas 2 activités"
    )
    
    # Vérifier tokens sur 7 jours
    query_tokens = """
        SELECT SUM(montant_jeton) as total
        FROM jeton
        WHERE id_utilisateur = %s
    """
    tokens_result = db.execute(query_tokens, (user_id,), fetch=True)
    total_tokens = tokens_result[0]["total"] if tokens_result else 0
    
    result.add_test(
        "Test 1.1c - 70 tokens cumulés (7 jours × 10)",
        total_tokens == 70,
        f"Attendu: 70, Reçu: {total_tokens}"
    )
    
    # Vérifier série finale
    serie_finale = get_serie(db, user_id)
    
    result.add_test(
        "Test 1.1d - Série = 7 après 7 jours",
        serie_finale == 7,
        f"Attendu: 7, Reçu: {serie_finale}"
    )

# ====================================
# TESTS GROUPE 2 : Pas de doublons
# ====================================

def test_group_2_pas_doublons(result, db, user_id):
    """GROUPE 2 : Vérification absence doublons"""
    print(f"\n{Fore.CYAN}📋 GROUPE 2 : Absence de Doublons{Style.RESET_ALL}")
    print("-" * 70)
    
    # Test 2.1 : Pas de doublon activités même jour/pilier
    print("\n🧪 Test 2.1 : Pas de doublon activités")
    
    query_duplicates = """
        SELECT id_utilisateur, id_pilier, date_activite, COUNT(*) as count
        FROM activite
        WHERE id_utilisateur = %s
        GROUP BY id_utilisateur, id_pilier, date_activite
        HAVING COUNT(*) > 1
    """
    duplicates = db.execute(query_duplicates, (user_id,), fetch=True)
    
    result.add_test(
        "Test 2.1 - Aucun doublon activité",
        len(duplicates) == 0,
        f"Doublons trouvés: {len(duplicates)}"
    )

# ====================================
# TESTS GROUPE 3 : Reset série simulé
# ====================================

def test_group_3_reset_serie(result, db, user_id, pilier_strava_id, pilier_spotify_id):
    """GROUPE 3 : Simulation reset série"""
    print(f"\n{Fore.CYAN}📋 GROUPE 3 : Reset Série (Simulé){Style.RESET_ALL}")
    print("-" * 70)
    
    # Test 3.1 : Série à 5, puis jour raté, puis reprise
    print("\n🧪 Test 3.1 : Série 5 → Jour raté → Reprise")
    
    today = datetime.now().date()
    
    # Jours 1-5 : Activités validées
    for i in range(5):
        date = today - timedelta(days=9-i)
        create_activities_for_date(db, user_id, pilier_strava_id, pilier_spotify_id, date, 45, 30)
        update_serie(db, user_id, i+1, date)
    
    serie_avant_reset = get_serie(db, user_id)
    
    result.add_test(
        "Test 3.1a - Série = 5 avant jour raté",
        serie_avant_reset == 5,
        f"Attendu: 5, Reçu: {serie_avant_reset}"
    )
    
    # Jour 6 : Jour raté (aucune activité)
    date_ratee = today - timedelta(days=4)
    update_serie(db, user_id, 0, date_ratee)
    
    serie_apres_reset = get_serie(db, user_id)
    
    result.add_test(
        "Test 3.1b - Série = 0 après jour raté",
        serie_apres_reset == 0,
        f"Attendu: 0, Reçu: {serie_apres_reset}"
    )
    
    # Jours 7-9 : Reprise
    for i in range(3):
        date = today - timedelta(days=3-i)
        create_activities_for_date(db, user_id, pilier_strava_id, pilier_spotify_id, date, 45, 30)
        update_serie(db, user_id, i+1, date)
    
    serie_reprise = get_serie(db, user_id)
    
    result.add_test(
        "Test 3.1c - Série = 3 après reprise",
        serie_reprise == 3,
        f"Attendu: 3, Reçu: {serie_reprise}"
    )

# ====================================
# TESTS GROUPE 4 : Cohérence dates
# ====================================

def test_group_4_coherence_dates(result, db, user_id):
    """GROUPE 4 : Cohérence des dates"""
    print(f"\n{Fore.CYAN}📋 GROUPE 4 : Cohérence Dates{Style.RESET_ALL}")
    print("-" * 70)
    
    # Test 4.1 : Dates activités cohérentes
    print("\n🧪 Test 4.1 : Dates activités en ordre chronologique")
    
    query_dates = """
        SELECT DISTINCT date_activite
        FROM activite
        WHERE id_utilisateur = %s
        ORDER BY date_activite ASC
    """
    dates = db.execute(query_dates, (user_id,), fetch=True)
    
    if len(dates) > 1:
        dates_croissantes = all(
            dates[i]["date_activite"] < dates[i+1]["date_activite"]
            for i in range(len(dates)-1)
        )
        
        result.add_test(
            "Test 4.1 - Dates en ordre chronologique",
            dates_croissantes,
            "Dates non ordonnées"
        )
    else:
        result.add_test("Test 4.1 - Pas assez de dates", False)
    
    # Test 4.2 : date_maj série cohérente
    print("\n🧪 Test 4.2 : date_maj série cohérente")
    
    query_serie_date = """
        SELECT date_maj
        FROM serie
        WHERE id_utilisateur = %s
    """
    serie_date = db.execute(query_serie_date, (user_id,), fetch=True)
    
    if serie_date:
        date_maj = serie_date[0]["date_maj"]
        
        # Vérifier que date_maj est dans le passé récent (pas dans le futur)
        now = datetime.now()
        date_maj_datetime = date_maj if isinstance(date_maj, datetime) else datetime.combine(date_maj, datetime.min.time())
        
        date_coherente = date_maj_datetime <= now
        
        result.add_test(
            "Test 4.2 - date_maj série cohérente (pas dans le futur)",
            date_coherente,
            f"date_maj: {date_maj}"
        )

# ====================================
# TESTS GROUPE 5 : Structure BDD
# ====================================

def test_group_5_structure_bdd(result, db, user_id):
    """GROUPE 5 : Vérification structure BDD"""
    print(f"\n{Fore.CYAN}📋 GROUPE 5 : Structure BDD{Style.RESET_ALL}")
    print("-" * 70)
    
    # Test 5.1 : Clé étrangère activite → utilisateur
    print("\n🧪 Test 5.1 : Intégrité référentielle activites")
    
    query_orphan_activities = """
        SELECT COUNT(*) as count
        FROM activite
        WHERE id_utilisateur NOT IN (SELECT id FROM utilisateur)
    """
    orphans = db.execute(query_orphan_activities, fetch=True)
    nb_orphans = orphans[0]["count"] if orphans else 0
    
    result.add_test(
        "Test 5.1 - Aucune activité orpheline",
        nb_orphans == 0,
        f"Activités orphelines: {nb_orphans}"
    )
    
    # Test 5.2 : Contrainte UNIQUE sur activités
    print("\n🧪 Test 5.2 : Contrainte UNIQUE activités")
    
    query_check_constraint = """
        SELECT COUNT(*) as count
        FROM pg_constraint
        WHERE conname = 'unique_activite_jour'
    """
    constraint_exists = db.execute(query_check_constraint, fetch=True)
    has_constraint = constraint_exists[0]["count"] > 0 if constraint_exists else False
    
    result.add_test(
        "Test 5.2 - Contrainte UNIQUE existe",
        has_constraint,
        "Contrainte unique_activite_jour manquante"
    )

# ====================================
# MAIN
# ====================================

def main():
    print(f"\n{Fore.CYAN}{'='*70}{Style.RESET_ALL}")
    print(f"{Fore.CYAN}🧪 SCRIPT DE TESTS AUTOMATISÉS - CARTE 4 : MULTI-JOURS & SÉRIE{Style.RESET_ALL}")
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
    user_id = setup_test_user(db)
    
    if not user_id:
        print(f"{Fore.RED}❌ Échec du setup{Style.RESET_ALL}")
        db.close()
        return
    
    pilier_strava_id, pilier_spotify_id = create_piliers(db, user_id)
    
    if not pilier_strava_id or not pilier_spotify_id:
        print(f"{Fore.RED}❌ Échec création piliers{Style.RESET_ALL}")
        cleanup_test_user(db, user_id)
        db.close()
        return
    
    try:
        # Exécuter tous les groupes de tests
        test_group_1_historique_multi_jours(result, db, user_id, pilier_strava_id, pilier_spotify_id)
        test_group_2_pas_doublons(result, db, user_id)
        test_group_3_reset_serie(result, db, user_id, pilier_strava_id, pilier_spotify_id)
        test_group_4_coherence_dates(result, db, user_id)
        test_group_5_structure_bdd(result, db, user_id)
        
    finally:
        # Cleanup
        cleanup_test_user(db, user_id)
        db.close()
    
    # Afficher le résumé
    result.print_summary()

if __name__ == "__main__":
    main()
    