
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

def init_db():
    conn = get_db_connection()
    if conn is None:
        return False
    
    try:
        cur = conn.cursor()
        # Criação das tabelas se não existirem
        cur.execute("""
            CREATE TABLE IF NOT EXISTS doctor (
                id SERIAL PRIMARY KEY,
                full_name VARCHAR(100) NOT NULL,
                crm VARCHAR(20) NOT NULL UNIQUE,
                rqe VARCHAR(20)
            )
        """)
        
        cur.execute("""
            CREATE TABLE IF NOT EXISTS template (
                id SERIAL PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                content TEXT NOT NULL,
                category VARCHAR(50) NOT NULL,
                doctor_id INTEGER REFERENCES doctor(id),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                last_modified TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        
        conn.commit()
        return True
    except Exception as e:
        print(f"Erro ao inicializar banco de dados: {e}")
        return False
    finally:
        if conn:
            conn.close()

if __name__ == "__main__":
    test_connection()
