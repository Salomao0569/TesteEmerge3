import os
import secrets
from flask import Flask, render_template, request, jsonify, send_file
from flask_sqlalchemy import SQLAlchemy
from flask_wtf.csrf import CSRFProtect
from flask_caching import Cache
from flask_compress import Compress
from bs4 import BeautifulSoup
from dotenv import load_dotenv
from sqlalchemy import text

from models import db, Doctor, Template

# Carregar variáveis de ambiente
load_dotenv()

# Inicialização do Flask
app = Flask(__name__)

# Configuração das extensões
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SECRET_KEY'] = os.getenv('FLASK_SECRET_KEY', secrets.token_hex(32))
app.config['WTF_CSRF_SECRET_KEY'] = os.getenv('WTF_CSRF_SECRET_KEY', secrets.token_hex(32))
app.config['CACHE_TYPE'] = 'simple'

# Inicialização das extensões
try:
    print("Iniciando configuração do Flask...")
    db.init_app(app)
    csrf = CSRFProtect(app)
    cache = Cache(app)
    Compress(app)
    print("Extensões inicializadas com sucesso!")
except Exception as e:
    print(f"Erro ao inicializar extensões: {str(e)}")
    raise

# Inicialização do banco de dados
with app.app_context():
    try:
        print("Verificando conexão com o banco de dados...")
        # Tenta executar uma query simples para verificar a conexão
        db.session.execute(text('SELECT 1'))
        db.session.commit()
        print("Conexão com o banco de dados estabelecida.")
        
        print("Criando tabelas se não existirem...")
        db.create_all()
        print("Banco de dados inicializado e conectado com sucesso!")
    except Exception as e:
        print(f"Erro ao inicializar o banco de dados: {str(e)}")
        print(f"DATABASE_URL configurada: {app.config['SQLALCHEMY_DATABASE_URI']}")
        raise

@app.route('/')
def index():
    try:
        doctors = Doctor.query.all()
        templates = Template.query.all()
        return render_template('index.html', doctors=doctors, templates=templates)
    except Exception as e:
        print(f"Erro ao acessar o banco: {e}")
        return "Erro ao conectar ao banco de dados", 500

@app.route('/doctors')
def doctors():
    doctors = Doctor.query.all()
    return render_template('doctors.html', doctors=doctors)

@app.route('/api/doctors', methods=['GET'])
def get_doctors():
    try:
        doctors = Doctor.query.all()
        return jsonify([doctor.to_dict() for doctor in doctors])
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/doctors', methods=['POST'])
def create_doctor():
    try:
        data = request.get_json()
        new_doctor = Doctor(
            full_name=data['full_name'],
            crm=data['crm'],
            rqe=data.get('rqe', '')
        )
        db.session.add(new_doctor)
        db.session.commit()
        return jsonify(new_doctor.to_dict()), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 400

@app.route('/api/doctors/<int:doctor_id>', methods=['DELETE'])
def delete_doctor(doctor_id):
    try:
        doctor = Doctor.query.get_or_404(doctor_id)
        db.session.delete(doctor)
        db.session.commit()
        return '', 204
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 400

@app.route('/templates')
def templates():
    doctors = Doctor.query.all()
    templates = Template.query.all()
    return render_template('templates.html', doctors=doctors, templates=templates)

@app.route('/reports')
def reports():
    doctors = Doctor.query.all()
    templates = Template.query.all()
    return render_template('reports.html', doctors=doctors, templates=templates)

@app.route('/api/templates', methods=['POST'])
def create_template():
    try:
        data = request.get_json()
        new_template = Template(
            name=data['name'],
            content=data['content'],
            category=data.get('category', 'laudo'),
            doctor_id=data.get('doctor_id')
        )
        db.session.add(new_template)
        db.session.commit()
        return jsonify(new_template.to_dict()), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 400

@app.route('/api/templates/<int:template_id>', methods=['DELETE'])
def delete_template(template_id):
    try:
        template = Template.query.get_or_404(template_id)
        db.session.delete(template)
        db.session.commit()
        return '', 204
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 400

if __name__ == '__main__':
    try:
        with app.app_context():
            db.create_all()
            print("Tabelas criadas com sucesso!")
    except Exception as e:
        print(f"Erro ao criar tabelas: {e}")
    
    app.run(host='0.0.0.0', port=3000, debug=True)
