#!/usr/bin/env python3
"""Script to import CSV data into PostgreSQL for Sapuri system"""

import csv
import os
import psycopg2
from datetime import datetime

DATABASE_URL = "postgresql://sapuri:sapuri123@localhost:5432/sapuri"

def parse_bool(value):
    """Parse boolean from CSV (1/0)"""
    if value is None or value == '':
        return None
    return value in ('1', 'true', 'True', True, 1)

def parse_int(value):
    """Parse integer from CSV"""
    if value is None or value == '':
        return None
    return int(value)

def parse_timestamp(value):
    """Parse timestamp from CSV"""
    if value is None or value == '':
        return None
    try:
        return datetime.strptime(value, '%Y-%m-%d %H:%M:%S')
    except:
        try:
            return datetime.strptime(value, '%Y-%m-%d')
        except:
            return None

def import_csv(conn, table_name, csv_file, column_mapping=None):
    """Import CSV file into PostgreSQL table"""
    if not os.path.exists(csv_file):
        print(f"  File not found: {csv_file}")
        return 0
    
    with open(csv_file, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        rows = list(reader)
    
    if not rows:
        print(f"  No data in {csv_file}")
        return 0
    
    cursor = conn.cursor()
    count = 0
    
    for row in rows:
        # Map columns if needed
        if column_mapping:
            row = {column_mapping.get(k, k): v for k, v in row.items()}
        
        # Filter to only include columns in the row
        columns = [k for k in row.keys() if row[k] is not None and row[k] != '']
        values = [row[k] for k in columns]
        
        # Create INSERT statement
        placeholders = ', '.join(['%s'] * len(columns))
        cols = ', '.join([f'"{c}"' for c in columns])
        
        try:
            cursor.execute(f'INSERT INTO "{table_name}" ({cols}) VALUES ({placeholders}) ON CONFLICT DO NOTHING', values)
            count += 1
        except Exception as e:
            print(f"  Error inserting row: {e}")
            conn.rollback()
            continue
    
    conn.commit()
    return count

def main():
    conn = psycopg2.connect(DATABASE_URL)
    base_path = "/home/ubuntu/sapuri_system"
    
    # CSV files to import (in order due to foreign key dependencies)
    imports = [
        # Core tables first
        ("users", f"{base_path}/users_20260304_195055.csv"),
        ("members", f"{base_path}/members_20260304_195352.csv"),
        ("eventTypes", f"{base_path}/eventTypes_20260304_195321.csv"),
        ("botConfig", f"{base_path}/botConfig_20260304_195248.csv"),
        
        # Schedules
        ("schedules", f"{base_path}/schedules_20260304_195426.csv"),
        ("scheduleEntries", f"{base_path}/scheduleEntries_20260304_195422.csv"),
        
        # Announcements
        ("announcements", f"{base_path}/announcements_20260304_195238.csv"),
        ("announcementRecipients", f"{base_path}/announcementRecipients_20260304_195233.csv"),
        
        # GvG data
        ("gvgAttacks", f"{base_path}/gvgAttacks_20260304_195334.csv"),
        ("gvgMatchInfo", f"{base_path}/gvgMatchInfo_20260304_195338.csv"),
        ("gvgStrategies", f"{base_path}/gvgStrategies_20260304_195345.csv"),
        
        # GoT data
        ("gotAttacks", f"{base_path}/gotAttacks_20260304_195326.csv"),
        ("gotStrategies", f"{base_path}/gotStrategies_20260304_195330.csv"),
        
        # Reliquias data
        ("reliquiasSeasons", f"{base_path}/reliquiasSeasons_20260304_195415.csv"),
        ("reliquiasBossProgress", f"{base_path}/reliquiasBossProgress_20260304_195359.csv"),
        ("reliquiasMemberAssignments", f"{base_path}/reliquiasMemberAssignments_20260304_195406.csv"),
        ("reliquiasMemberRoles", f"{base_path}/reliquiasMemberRoles_20260304_195411.csv"),
        
        # Cards
        ("cards", f"{base_path}/cards_20260304_195255.csv"),
        
        # AI Chat
        ("aiChatHistory", f"{base_path}/aiChatHistory_20260304_195223.csv"),
        ("aiChatSessions", f"{base_path}/aiChatSessions_20260304_195228.csv"),
    ]
    
    print("Starting data import...")
    
    for table_name, csv_file in imports:
        print(f"\nImporting {table_name}...")
        count = import_csv(conn, table_name, csv_file)
        print(f"  Imported {count} rows")
    
    # Update sequences to max ID + 1
    print("\nUpdating sequences...")
    cursor = conn.cursor()
    
    tables_with_serial = [
        "users", "members", "eventTypes", "schedules", "scheduleEntries",
        "announcements", "announcementRecipients", "gvgAttacks", "gvgMatchInfo",
        "gvgStrategies", "gotAttacks", "gotStrategies", "reliquiasSeasons",
        "reliquiasBossProgress", "reliquiasMemberRoles", "cards", "botConfig"
    ]
    
    for table in tables_with_serial:
        try:
            cursor.execute(f'''
                SELECT setval(pg_get_serial_sequence('"{table}"', 'id'), 
                       COALESCE((SELECT MAX(id) FROM "{table}"), 0) + 1, false)
            ''')
        except Exception as e:
            print(f"  Could not update sequence for {table}: {e}")
            conn.rollback()
    
    conn.commit()
    
    # Verify import
    print("\nVerifying import...")
    cursor.execute('SELECT COUNT(*) FROM members')
    print(f"  Members: {cursor.fetchone()[0]}")
    cursor.execute('SELECT COUNT(*) FROM "eventTypes"')
    print(f"  Event Types: {cursor.fetchone()[0]}")
    cursor.execute('SELECT COUNT(*) FROM "gvgAttacks"')
    print(f"  GvG Attacks: {cursor.fetchone()[0]}")
    cursor.execute('SELECT COUNT(*) FROM "gotAttacks"')
    print(f"  GoT Attacks: {cursor.fetchone()[0]}")
    cursor.execute('SELECT COUNT(*) FROM "gvgStrategies"')
    print(f"  GvG Strategies: {cursor.fetchone()[0]}")
    cursor.execute('SELECT COUNT(*) FROM "gotStrategies"')
    print(f"  GoT Strategies: {cursor.fetchone()[0]}")
    
    conn.close()
    print("\nImport completed!")

if __name__ == "__main__":
    main()
