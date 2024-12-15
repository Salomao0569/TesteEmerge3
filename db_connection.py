
import psycopg2
from psycopg2.extras import DictCursor
import os
from dotenv import load_dotenv

def get_db_connection():
    try:
        connection = psycopg2.connect(
            host="34.46.61.123",
            database="biocardio",
            user="biocardio",
            password="biocardio86",
            port="5432",
            sslmode='require'
        )
        return connection
    except psycopg2.Error as e:
        print(f"Erro ao conectar ao PostgreSQL: {e}")
        return None

def test_connection():
    try:
        conn = get_db_connection()
        if conn:
            cursor = conn.cursor()
            cursor.execute('SELECT version();')
            version = cursor.fetchone()
            print(f"Conexão bem sucedida! Versão: {version}")
            
            cursor.close()
            conn.close()
            return True
        return False
    except Exception as e:
        print(f"Erro no teste de conexão: {e}")
        return False

if __name__ == "__main__":
    test_connection()
