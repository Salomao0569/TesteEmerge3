import os
import logging
from flask import Flask, render_template, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_wtf.csrf import CSRFProtect, generate_csrf
from models import db, Doctor, Template, Report
from dotenv import load_dotenv

# Carregar variáveis de ambiente
load_dotenv()

# Configurar logging detalhado
logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

def create_app():
    app = Flask(__name__)

    # Configuração detalhada do banco de dados
    database_url = os.environ.get('DATABASE_URL')
    if not database_url:
        logger.error("DATABASE_URL não está definida nas variáveis de ambiente")
        raise ValueError("DATABASE_URL é obrigatória")

    logger.info("Inicializando aplicação com configurações...")
    logger.info(f"Database URL: {database_url}")

    # Configuração básica
    app.config.update(
        SQLALCHEMY_DATABASE_URI=database_url,
        SQLALCHEMY_TRACK_MODIFICATIONS=False,
        SECRET_KEY=os.environ.get('SECRET_KEY', os.urandom(32)),
        WTF_CSRF_ENABLED=True,
        WTF_CSRF_CHECK_DEFAULT=False
    )

    # Inicializar extensões com tratamento de erro detalhado
    try:
        logger.info("Inicializando extensões do Flask...")
        db.init_app(app)
        csrf = CSRFProtect()
        csrf.init_app(app)
        logger.info("Extensões inicializadas com sucesso")
    except Exception as e:
        logger.error(f"Erro crítico ao inicializar extensões: {str(e)}", exc_info=True)
        raise

    return app

app = create_app()

@app.route('/')
def index():
    try:
        logger.info("Acessando rota principal")
        doctors = Doctor.query.all()
        templates = Template.query.all()
        logger.info(f"Encontrados {len(doctors)} médicos e {len(templates)} templates")
        return render_template('index.html', doctors=doctors, templates=templates)
    except Exception as e:
        logger.error(f"Erro ao carregar página inicial: {str(e)}", exc_info=True)
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

@app.route('/api/templates', methods=['GET'])
def get_templates():
    try:
        category = request.args.get('category')
        query = Template.query
        if category:
            query = query.filter_by(category=category)
        templates = query.all()
        return jsonify([template.to_dict() for template in templates])
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/templates', methods=['POST'])
def create_template():
    try:
        if not request.is_json:
            return jsonify({"error": "Content-Type deve ser application/json"}), 400

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

@app.route('/api/reports', methods=['POST'])
def create_report():
    try:
        data = request.get_json()

        # Converter string de data para objeto date
        exam_date = datetime.strptime(data['exam_date'], '%Y-%m-%d').date() if data.get('exam_date') else None
        birthdate = datetime.strptime(data['patient_birthdate'], '%Y-%m-%d').date() if data.get('patient_birthdate') else None

        new_report = Report(
            patient_name=data['patient_name'],
            patient_birthdate=birthdate,
            patient_gender=data['patient_gender'],
            patient_weight=data.get('patient_weight'),
            patient_height=data.get('patient_height'),
            body_surface=data.get('body_surface'),
            exam_date=exam_date,
            left_atrium=data.get('left_atrium'),
            aorta=data.get('aorta'),
            ascending_aorta=data.get('ascending_aorta'),
            diastolic_diameter=data.get('diastolic_diameter'),
            systolic_diameter=data.get('systolic_diameter'),
            septum_thickness=data.get('septum_thickness'),
            posterior_wall=data.get('posterior_wall'),
            right_ventricle=data.get('right_ventricle'),
            content=data['content'],
            doctor_id=data['doctor_id']
        )

        db.session.add(new_report)
        db.session.commit()
        return jsonify(new_report.to_dict()), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 400

@app.route('/api/reports/<int:report_id>', methods=['GET'])
def get_report(report_id):
    try:
        report = Report.query.get_or_404(report_id)
        return jsonify(report.to_dict())
    except Exception as e:
        return jsonify({"error": str(e)}), 404

@app.after_request
def add_csrf_header(response):
    if 'text/html' in response.headers.get('Content-Type', ''):
        response.headers.set('X-CSRFToken', generate_csrf())
    return response

if __name__ == '__main__':
    with app.app_context():
        try:
            logger.info("Tentando criar tabelas do banco de dados...")
            db.create_all()
            logger.info("Tabelas do banco de dados criadas com sucesso")
        except Exception as e:
            logger.error(f"Erro ao criar tabelas do banco de dados: {e}", exc_info=True)
            raise
    app.run(host='0.0.0.0', port=3000, debug=True)