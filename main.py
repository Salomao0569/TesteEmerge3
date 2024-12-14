from flask import Flask, render_template, request, jsonify
from models import db, Doctor, Template
from assets import init_assets
import logging
import os

app = Flask(__name__)
database_url = os.environ.get('DATABASE_URL', 'sqlite:///app.db')
if database_url.startswith("postgres://"):
    database_url = database_url.replace("postgres://", "postgresql://", 1)
app.config['SQLALCHEMY_DATABASE_URI'] = database_url
app.config['SQLALCHEMY_ENGINE_OPTIONS'] = {
    'connect_args': {'sslmode': 'require'} if 'postgresql' in database_url else {}
}
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Configure logging
logging.basicConfig(level=logging.INFO)

# Initialize database and assets
db.init_app(app)
assets = init_assets(app)

with app.app_context():
    db.create_all()

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
        
        if not all(key in data for key in ['name', 'category', 'content']):
            missing_fields = [key for key in ['name', 'category', 'content'] if key not in data]
            error_msg = f"Campos obrigatórios faltando: {', '.join(missing_fields)}"
            app.logger.error(error_msg)
            return jsonify({'error': error_msg}), 400
        
        # Validar dados
        if not data['name'].strip():
            error_msg = "Nome não pode estar vazio"
            app.logger.error(error_msg)
            return jsonify({'error': error_msg}), 400
            
        if not data['content'].strip():
            error_msg = "Conteúdo não pode estar vazio"
            app.logger.error(error_msg)
            return jsonify({'error': error_msg}), 400
            
        app.logger.info(f"Criando template: {data['name']}")
        app.logger.info(f"Conteúdo: {data['content'][:100]}...")
        
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
        data = request.json
        doctor = Doctor(
            full_name=data['full_name'],
            crm=data['crm'],
            rqe=data['rqe']
        )
        db.session.add(doctor)
        db.session.commit()
        return jsonify(doctor.to_dict()), 201
    except Exception as e:
        db.session.rollback()
        app.logger.error(f"Erro ao criar médico: {str(e)}")
        return jsonify({'error': str(e)}), 400

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
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port)