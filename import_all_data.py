import os
import csv
import psycopg2
from glob import glob

DATABASE_URL = os.environ.get('DATABASE_URL', 'postgresql://sapuri:sapuri123@localhost:5432/sapuri')

# Mapeamento de arquivos CSV para tabelas
TABLE_MAPPING = {
    'users': 'users',
    'members': 'members',
    'eventTypes': '"eventTypes"',
    'schedules': 'schedules',
    'scheduleEntries': '"scheduleEntries"',
    'announcements': 'announcements',
    'announcementRecipients': '"announcementRecipients"',
    'gvgAttacks': '"gvgAttacks"',
    'gvgMatchInfo': '"gvgMatchInfo"',
    'gvgStrategies': '"gvgStrategies"',
    'gotAttacks': '"gotAttacks"',
    'gotStrategies': '"gotStrategies"',
    'reliquiasSeasons': '"reliquiasSeasons"',
    'reliquiasBossProgress': '"reliquiasBossProgress"',
    'reliquiasMemberAssignments': '"reliquiasMemberAssignments"',
    'reliquiasMemberRoles': '"reliquiasMemberRoles"',
    'cards': 'cards',
    'botConfig': '"botConfig"',
}

# Ordem de importação (respeitando foreign keys)
IMPORT_ORDER = [
    'users', 'members', 'eventTypes', 'schedules', 'scheduleEntries',
    'announcements', 'announcementRecipients',
    'gvgMatchInfo', 'gvgAttacks', 'gvgStrategies',
    'gotAttacks', 'gotStrategies',
    'reliquiasSeasons', 'reliquiasBossProgress', 'reliquiasMemberAssignments', 'reliquiasMemberRoles',
    'cards', 'botConfig'
]

def parse_value(val, col_name):
    """Parse CSV values for PostgreSQL"""
    if val == '' or val is None or val == 'NULL':
        return None
    # Boolean columns
    if col_name in ['isActive', 'participatesGvg', 'participatesGot', 'participatesReliquias',
                    'attack1Missed', 'attack2Missed', 'didNotAttack', 'isAdmin']:
        return val == '1' or val.lower() == 'true'
    return val

def import_csv(conn, csv_path, table_name):
    """Import a CSV file into a PostgreSQL table"""
    with open(csv_path, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        rows = list(reader)
    
    if not rows:
        return 0
    
    columns = list(rows[0].keys())
    # Quote column names for PostgreSQL
    col_str = ', '.join(f'"{c}"' for c in columns)
    placeholders = ', '.join(['%s'] * len(columns))
    
    inserted = 0
    with conn.cursor() as cur:
        for row in rows:
            values = [parse_value(row[c], c) for c in columns]
            try:
                cur.execute(
                    f'INSERT INTO {table_name} ({col_str}) VALUES ({placeholders}) ON CONFLICT DO NOTHING',
                    values
                )
                if cur.rowcount > 0:
                    inserted += 1
            except Exception as e:
                print(f"  Erro ao inserir: {e}")
                conn.rollback()
                continue
        conn.commit()
    
    return inserted

def update_sequences(conn):
    """Update PostgreSQL sequences to max ID"""
    sequences = [
        ('members', 'id'),
        ('users', 'id'),
        ('"gvgAttacks"', 'id'),
        ('"gotAttacks"', 'id'),
        ('"gvgStrategies"', 'id'),
        ('"gotStrategies"', 'id'),
        ('schedules', 'id'),
        ('"eventTypes"', 'id'),
        ('"reliquiasSeasons"', 'id'),
    ]
    with conn.cursor() as cur:
        for table, col in sequences:
            try:
                cur.execute(f'SELECT MAX("{col}") FROM {table}')
                max_id = cur.fetchone()[0]
                if max_id:
                    seq_name = f'{table.replace(chr(34), "")}_{col}_seq'
                    cur.execute(f"SELECT setval('{seq_name}', {max_id}, true)")
            except Exception as e:
                pass  # Sequence may not exist
        conn.commit()

def main():
    backup_dir = '/home/ubuntu/sapuri_original'
    conn = psycopg2.connect(DATABASE_URL)
    
    results = {}
    
    for table_prefix in IMPORT_ORDER:
        # Find CSV file
        pattern = f'{backup_dir}/{table_prefix}_*.csv'
        files = glob(pattern)
        if not files:
            continue
        
        csv_file = sorted(files)[-1]  # Use most recent
        table_name = TABLE_MAPPING.get(table_prefix, table_prefix)
        
        print(f"Importando {table_prefix}...")
        try:
            count = import_csv(conn, csv_file, table_name)
            results[table_prefix] = count
            print(f"  {count} registros importados")
        except Exception as e:
            print(f"  ERRO: {e}")
            results[table_prefix] = f"ERRO: {e}"
    
    print("\nAtualizando sequences...")
    update_sequences(conn)
    
    conn.close()
    
    print("\n=== RESUMO DA IMPORTAÇÃO ===")
    for table, count in results.items():
        print(f"  {table}: {count}")

if __name__ == '__main__':
    main()
