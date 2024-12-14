from flask import Flask, render_template, request, jsonify
from models import db, Doctor, Template
import logging
import os

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('DATABASE_URL')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Configure logging
logging.basicConfig(level=logging.INFO)

# Initialize database
db.init_app(app)

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
        data = request.json
        template = Template(
            name=data['name'],
            category=data['category'],
            content=data['content']
        )
        db.session.add(template)
        db.session.commit()
        return jsonify(template.to_dict()), 201
    except Exception as e:
        db.session.rollback()
        app.logger.error(f"Erro ao criar template: {str(e)}")
        return jsonify({'error': str(e)}), 400

@app.route('/api/templates/<int:id>', methods=['DELETE'])
def delete_template(id):
    try:
        template = Template.query.get_or_404(id)
        db.session.delete(template)
        db.session.commit()
        return '', 204
    except Exception as e:
        db.session.rollback()
        app.logger.error(f"Erro ao deletar template: {str(e)}")
        return jsonify({'error': str(e)}), 400

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
    app.run(host='0.0.0.0', port=5000, debug=True)