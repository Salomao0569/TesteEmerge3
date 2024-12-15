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

app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///app.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Configure logging
logging.basicConfig(level=logging.INFO)

# Initialize database
db.init_app(app)

# Drop and recreate tables
with app.app_context():
    try:
        app.logger.info("Recriando tabelas no SQLite...")
        db.drop_all()
        db.create_all()
        app.logger.info("Tabelas recriadas com sucesso!")
    except Exception as e:
        app.logger.error(f"Erro ao recriar tabelas: {str(e)}")

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

@app.route('/gerar_doc', methods=['POST'])
def gerar_doc():
    from docx import Document
    from docx.shared import Pt, Inches
    try:
        data = request.json
        doc = Document()
        
        # Add title
        doc.add_heading('Laudo de Ecodopplercardiograma', 0)
        
        # Add patient info
        doc.add_paragraph(f"Nome: {data['paciente']['nome']}")
        doc.add_paragraph(f"Data do Exame: {data['paciente']['dataExame']}")
        doc.add_paragraph(f"Data de Nascimento: {data['paciente']['dataNascimento']}")
        doc.add_paragraph(f"Sexo: {data['paciente']['sexo']}")
        doc.add_paragraph(f"Peso: {data['paciente']['peso']} kg")
        doc.add_paragraph(f"Altura: {data['paciente']['altura']} cm")
        
        # Add content
        doc.add_paragraph(data['laudo'])
        
        # Add doctor signature
        if data['medico']['nome']:
            doc.add_paragraph(f"\n\n{data['medico']['nome']}")
            doc.add_paragraph(f"CRM: {data['medico']['crm']}")
            if data['medico']['rqe']:
                doc.add_paragraph(f"RQE: {data['medico']['rqe']}")
        
        # Save to memory
        doc_io = BytesIO()
        doc.save(doc_io)
        doc_io.seek(0)
        
        return send_file(
            doc_io,
            mimetype='application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            as_attachment=True,
            download_name=f"Laudo_{data['paciente']['nome'].replace(' ', '_')}.docx"
        )
    except Exception as e:
        app.logger.error(f"Erro ao gerar DOC: {str(e)}")
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)