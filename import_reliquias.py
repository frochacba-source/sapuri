#!/usr/bin/env python3
"""Script para importar dados das tabelas de relíquias"""

import csv
import os
import psycopg2
from datetime import datetime

DATABASE_URL = os.environ.get('DATABASE_URL', 'postgresql://postgres:postgres123@localhost:5432/sapuri')
CSV_DIR = '/home/ubuntu/sapuri_original'

def parse_bool(value):
    if value is None or value == '':
        return None
    if isinstance(value, bool):
        return value
    return str(value).lower() in ('1', 'true', 'yes', 't')

def parse_int(value):
    if value is None or value == '':
        return None
    try:
        return int(value)
    except (ValueError, TypeError):
        return None

def import_reliquias_seasons(conn):
    """Importar reliquiasSeasons"""
    csv_file = os.path.join(CSV_DIR, 'reliquiasSeasons_20260304_195415.csv')
    if not os.path.exists(csv_file):
        print(f"Arquivo não encontrado: {csv_file}")
        return 0
    
    cursor = conn.cursor()
    count = 0
    
    with open(csv_file, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            try:
                cursor.execute('''
                    INSERT INTO "reliquiasSeasons" (id, name, "startDate", "endDate", "isActive", "createdAt", "updatedAt")
                    VALUES (%s, %s, %s, %s, %s, %s, %s)
                    ON CONFLICT (id) DO NOTHING
                ''', (
                    parse_int(row['id']),
                    row['name'],
                    row['startDate'],
                    row['endDate'] if row['endDate'] else None,
                    parse_bool(row['isActive']),
                    row['createdAt'],
                    row['updatedAt']
                ))
                if cursor.rowcount > 0:
                    count += 1
            except Exception as e:
                print(f"Erro em reliquiasSeasons: {e}")
                print(f"Row: {row}")
    
    conn.commit()
    cursor.close()
    return count

def import_reliquias_boss_progress(conn):
    """Importar reliquiasBossProgress"""
    csv_file = os.path.join(CSV_DIR, 'reliquiasBossProgress_20260304_195359.csv')
    if not os.path.exists(csv_file):
        print(f"Arquivo não encontrado: {csv_file}")
        return 0
    
    cursor = conn.cursor()
    count = 0
    
    with open(csv_file, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            try:
                cursor.execute('''
                    INSERT INTO "reliquiasBossProgress" (id, "seasonId", "bossId", "bossName", "currentHp", "maxHp", stage, "isDefeated", "createdAt", "updatedAt")
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                    ON CONFLICT (id) DO NOTHING
                ''', (
                    parse_int(row['id']),
                    parse_int(row['seasonId']),
                    parse_int(row['bossId']),
                    row['bossName'],
                    parse_int(row['currentHp']),
                    parse_int(row['maxHp']),
                    parse_int(row['stage']),
                    parse_bool(row['isDefeated']),
                    row['createdAt'],
                    row['updatedAt']
                ))
                if cursor.rowcount > 0:
                    count += 1
            except Exception as e:
                print(f"Erro em reliquiasBossProgress: {e}")
                print(f"Row: {row}")
    
    conn.commit()
    cursor.close()
    return count

def import_reliquias_member_assignments(conn):
    """Importar reliquiasMemberAssignments"""
    csv_file = os.path.join(CSV_DIR, 'reliquiasMemberAssignments_20260304_195406.csv')
    if not os.path.exists(csv_file):
        print(f"Arquivo não encontrado: {csv_file}")
        return 0
    
    cursor = conn.cursor()
    count = 0
    
    with open(csv_file, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            try:
                cursor.execute('''
                    INSERT INTO "reliquiasMemberAssignments" 
                    (id, "memberId", "bossName", "seasonId", "bossId", "assignedAt", "unassignedAt", "createdAt", "updatedAt", "attackNumber", role, "guard1Number", "guard2Number", performance)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                    ON CONFLICT (id) DO NOTHING
                ''', (
                    parse_int(row['id']),
                    parse_int(row['memberId']),
                    row['bossName'],
                    parse_int(row['seasonId']),
                    parse_int(row['bossId']),
                    row.get('assignedAt') if row.get('assignedAt') else None,
                    row.get('unassignedAt') if row.get('unassignedAt') else None,
                    row['createdAt'],
                    row['updatedAt'],
                    parse_int(row.get('attackNumber')),
                    row.get('role') if row.get('role') else 'guards',
                    parse_int(row.get('guard1Number')),
                    parse_int(row.get('guard2Number')),
                    row.get('performance') if row.get('performance') else None
                ))
                if cursor.rowcount > 0:
                    count += 1
            except Exception as e:
                print(f"Erro em reliquiasMemberAssignments: {e}")
                print(f"Row: {row}")
    
    conn.commit()
    cursor.close()
    return count

def update_sequences(conn):
    """Atualiza sequências para continuar após max id"""
    cursor = conn.cursor()
    tables = ['reliquiasSeasons', 'reliquiasBossProgress', 'reliquiasMemberAssignments']
    
    for table in tables:
        try:
            cursor.execute(f'SELECT MAX(id) FROM "{table}"')
            max_id = cursor.fetchone()[0]
            if max_id:
                cursor.execute(f"SELECT setval('\"{table}_id_seq\"', {max_id})")
                print(f"Sequência {table}_id_seq atualizada para {max_id}")
        except Exception as e:
            print(f"Erro ao atualizar sequência {table}: {e}")
    
    conn.commit()
    cursor.close()

def main():
    print("=" * 60)
    print("IMPORTAÇÃO DE DADOS DAS RELÍQUIAS")
    print("=" * 60)
    
    conn = psycopg2.connect(DATABASE_URL)
    
    # Importar dados
    seasons = import_reliquias_seasons(conn)
    print(f"✓ reliquiasSeasons: {seasons} registros importados")
    
    boss_progress = import_reliquias_boss_progress(conn)
    print(f"✓ reliquiasBossProgress: {boss_progress} registros importados")
    
    member_assignments = import_reliquias_member_assignments(conn)
    print(f"✓ reliquiasMemberAssignments: {member_assignments} registros importados")
    
    # Atualizar sequências
    update_sequences(conn)
    
    # Verificar contagem final
    cursor = conn.cursor()
    print("\n" + "=" * 60)
    print("VERIFICAÇÃO FINAL")
    print("=" * 60)
    
    for table in ['reliquiasSeasons', 'reliquiasBossProgress', 'reliquiasMemberAssignments']:
        cursor.execute(f'SELECT COUNT(*) FROM "{table}"')
        count = cursor.fetchone()[0]
        print(f"{table}: {count} registros")
    
    cursor.close()
    conn.close()
    
    print("\n✓ Importação concluída com sucesso!")

if __name__ == '__main__':
    main()
