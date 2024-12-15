import os
from flask import Flask, render_template, request, jsonify, send_file
from flask_sqlalchemy import SQLAlchemy
from flask_wtf.csrf import CSRFProtect
from flask_caching import Cache
from flask_compress import Compress
from models import db, Doctor, Template
import io
# from docx import Document
# from docx.shared import Pt, Inches
# from docx.enum.text import WD_ALIGN_PARAGRAPH, WD_LINE_SPACING
from bs4 import BeautifulSoup
from dotenv import load_dotenv
import secrets

# Carregar variáveis de ambiente
load_dotenv()

# Inicialização do Flask
app = Flask(__name__)

# Configuração das extensões
app.config.update(
    CACHE_TYPE='simple',
    SQLALCHEMY_DATABASE_URI=os.getenv('DATABASE_URL'),
    SQLALCHEMY_TRACK_MODIFICATIONS=False,
    SECRET_KEY=os.getenv('FLASK_SECRET_KEY', secrets.token_hex(32)),
    WTF_CSRF_SECRET_KEY=os.getenv('WTF_CSRF_SECRET_KEY', secrets.token_hex(32))
)

# Inicialização das extensões
cache = Cache(app)
csrf = CSRFProtect(app)
Compress(app)

# Inicialização do banco de dados
db.init_app(app)
with app.app_context():
    db.create_all()
    from sqlalchemy import text
    db.session.execute(text('ANALYZE'))  # Otimiza as estatísticas do PostgreSQL

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
    return render_template('templates.html')

#Example route for generating a DOCX report.  This needs to be adapted to your actual application
@app.route('/gerar_doc', methods=['POST'])
def gerar_doc():
    return jsonify({"error": "Função temporariamente desativada"}), 503




if __name__ == '__main__':
    try:
        with app.app_context():
            db.create_all()
            print("Tabelas criadas com sucesso!")
    except Exception as e:
        print(f"Erro ao criar tabelas: {e}")
    
    app.run(host='0.0.0.0', port=3000, debug=True)