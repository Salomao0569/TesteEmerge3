
from flask import Flask, render_template, jsonify, request
from flask_sqlalchemy import SQLAlchemy
from models import db, Doctor
import os
from dotenv import load_dotenv

app = Flask(__name__)

# Configuração do banco de dados
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SECRET_KEY'] = 'your-secret-key'

# Inicialização do banco de dados
db.init_app(app)

@app.route('/')
def index():
    doctors = Doctor.query.all()
    return render_template('index.html', doctors=doctors)

@app.route('/doctors')
def doctors():
    return render_template('doctors.html')

@app.route('/templates')
def templates():
    return render_template('templates.html')

if __name__ == '__main__':
    with app.app_context():
        try:
            db.create_all()
            print("Tabelas criadas com sucesso!")
        except Exception as e:
            print(f"Erro ao criar tabelas: {e}")
    
    app.run(host='0.0.0.0', port=5000, debug=True)
