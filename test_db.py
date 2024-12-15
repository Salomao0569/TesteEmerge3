
import psycopg2
from psycopg2.extras import DictCursor

def test_connection():
    try:
        # Tentativa de conexão
        connection = psycopg2.connect(
            host="34.46.61.123",
            database="biocardio",
            user="biocardio",
            password="biocardio86",
            port="5432"
        )
        
        # Se conseguir conectar, vamos tentar uma query simples
        cursor = connection.cursor()
        cursor.execute('SELECT version();')
        db_version = cursor.fetchone()
        print("Conexão bem sucedida!")
        print(f"Versão do PostgreSQL: {db_version}")
        
        # Vamos tentar listar as tabelas
        cursor.execute("""
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
        """)
        tables = cursor.fetchall()
        print("\nTabelas encontradas:")
        for table in tables:
            print(f"- {table[0]}")
            
        cursor.close()
        connection.close()
        
    except Exception as e:
        print(f"Erro ao conectar: {e}")

if __name__ == "__main__":
    test_connection()
