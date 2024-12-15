
from flask import Flask, render_template, request, jsonify, send_file
from datetime import datetime
from docx import Document
from docx.shared import Pt, Inches
from io import BytesIO
import html2text
from models import db, Doctor, Template
from assets import init_assets
import logging
import os

app = Flask(__name__)

# PostgreSQL configuration
app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://biocardio:biocardio86@34.46.61.123:5432/biocardio'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SQLALCHEMY_ENGINE_OPTIONS'] = {
    'pool_size': 3,
    'pool_recycle': 300,
    'pool_timeout': 60,
    'pool_pre_ping': True,
    'connect_timeout': 60
}

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

# Initialize database
db.init_app(app)

# Create tables
with app.app_context():
    try:
        app.logger.info("Creating tables in PostgreSQL...")
        db.create_all()
        
        # Add sample data if needed
        if not Doctor.query.first():
            sample_doctor = Doctor(
                full_name='Dr. Sample',
                crm='12345',
                rqe='67890'
            )
            db.session.add(sample_doctor)
            
            sample_template = Template(
                name='Template Padrão',
                content='Exame realizado com ritmo cardíaco regular...',
                category='laudo',
                doctor=sample_doctor
            )
            db.session.add(sample_template)
            db.session.commit()
            
        app.logger.info("Database initialized successfully!")
    except Exception as e:
        app.logger.error(f"Database initialization error: {str(e)}")

assets = init_assets(app)

@app.route('/')
def index():
    try:
        app.logger.info("Acessando rota principal")
        doctors = Doctor.query.all()
        templates = Template.query.all()
        return render_template('index.html', doctors=doctors, templates=templates)
    except Exception as e:
        app.logger.error(f"Erro ao acessar rota principal: {str(e)}")
        return str(e), 500

@app.route('/doctors')
def doctors():
    try:
        app.logger.info("Acessando rota /doctors")
        doctors = Doctor.query.all()
        app.logger.info(f"Médicos encontrados: {len(doctors)}")
        return render_template('doctors.html', doctors=doctors)
    except Exception as e:
        app.logger.error(f"Erro ao acessar /doctors: {str(e)}")
        return str(e), 500

@app.route('/templates')
def templates():
    try:
        app.logger.info("Acessando rota /templates")
        templates = Template.query.all()
        app.logger.info(f"Templates encontrados: {len(templates)}")
        return render_template('templates.html', templates=templates)
    except Exception as e:
        app.logger.error(f"Erro ao acessar /templates: {str(e)}")
        return str(e), 500

@app.route('/reports')
def reports():
    try:
        app.logger.info("Acessando rota /reports")
        templates = Template.query.filter_by(category='laudo').all()
        doctors = Doctor.query.all()
        app.logger.info(f"Modelos de laudo encontrados: {len(templates)}")
        app.logger.info(f"Médicos encontrados: {len(doctors)}")
        return render_template('reports.html', templates=templates, doctors=doctors)
    except Exception as e:
        app.logger.error(f"Erro ao acessar /reports: {str(e)}")
        return str(e), 500

@app.route('/api/templates/<int:id>', methods=['GET'])
def get_template(id):
    try:
        template = Template.query.get_or_404(id)
        return jsonify(template.to_dict())
    except Exception as e:
        app.logger.error(f"Erro ao buscar template {id}: {str(e)}")
        return jsonify({'error': str(e)}), 404

@app.route('/api/templates', methods=['GET'])
def get_templates():
    try:
        templates = Template.query.all()
        return jsonify([template.to_dict() for template in templates])
    except Exception as e:
        app.logger.error(f"Erro ao buscar templates: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/templates', methods=['POST'])
def create_template():
    try:
        app.logger.info("Recebendo requisição POST para criar template")
        
        if not request.is_json:
            error_msg = "Requisição deve ser JSON"
            app.logger.error(error_msg)
            return jsonify({'error': error_msg}), 400
            
        data = request.json
        app.logger.info(f"Dados recebidos: {data}")
        
        # Validar campos obrigatórios
        if not all(key in data for key in ['name', 'category', 'content']):
            missing_fields = [key for key in ['name', 'category', 'content'] if key not in data]
            error_msg = f"Campos obrigatórios faltando: {', '.join(missing_fields)}"
            app.logger.error(error_msg)
            return jsonify({'error': error_msg}), 400
            
        # Validar categoria
        valid_categories = ['laudo', 'normal', 'alterado', 'conclusao']
        if data['category'] not in valid_categories:
            error_msg = f"Categoria inválida. Use uma das seguintes: {', '.join(valid_categories)}"
            app.logger.error(error_msg)
            return jsonify({'error': error_msg}), 400
        
        template = Template(
            name=data['name'],
            category=data['category'],
            content=data['content'],
            doctor_id=data.get('doctor_id')
        )
        
        db.session.add(template)
        db.session.commit()
        
        app.logger.info(f"Template criado com sucesso: {template.name}")
        return jsonify(template.to_dict()), 201
        
    except Exception as e:
        db.session.rollback()
        app.logger.error(f"Erro ao criar template: {str(e)}")
        return jsonify({'error': str(e)}), 400

@app.route('/api/templates/<int:id>', methods=['DELETE'])
def delete_template(id):
    try:
        app.logger.info(f"Recebendo requisição DELETE para template {id}")
        template = Template.query.get_or_404(id)
        
        app.logger.info(f"Deletando template: {template.name}")
        db.session.delete(template)
        db.session.commit()
        
        app.logger.info(f"Template {id} deletado com sucesso")
        return '', 204
        
    except Exception as e:
        db.session.rollback()
        error_msg = f"Erro ao deletar template {id}: {str(e)}"
        app.logger.error(error_msg)
        return jsonify({'error': error_msg}), 400

@app.route('/api/doctors', methods=['GET'])
def get_doctors():
    try:
        doctors = Doctor.query.all()
        return jsonify([doctor.to_dict() for doctor in doctors])
    except Exception as e:
        app.logger.error(f"Erro ao buscar médicos: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/doctors', methods=['POST'])
def create_doctor():
    try:
        if not request.is_json:
            return jsonify({'error': 'Dados devem ser enviados em formato JSON'}), 400

        data = request.json
        if not data.get('full_name'):
            return jsonify({'error': 'Nome do médico é obrigatório'}), 400
        if not data.get('crm'):
            return jsonify({'error': 'CRM é obrigatório'}), 400

        doctor = Doctor(
            full_name=data['full_name'],
            crm=data['crm'],
            rqe=data.get('rqe', '')
        )
        db.session.add(doctor)
        db.session.commit()
        return jsonify(doctor.to_dict()), 201
    except Exception as e:
        db.session.rollback()
        app.logger.error(f"Erro ao criar médico: {str(e)}")
        return jsonify({'error': 'Erro ao cadastrar médico. Tente novamente.'}), 400

@app.route('/api/doctors/<int:id>', methods=['DELETE'])
def delete_doctor(id):
    try:
        doctor = Doctor.query.get_or_404(id)
        db.session.delete(doctor)
        db.session.commit()
        return '', 204
    except Exception as e:
        db.session.rollback()
        app.logger.error(f"Erro ao deletar médico: {str(e)}")
        return jsonify({'error': str(e)}), 400

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
