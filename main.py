import os
import io
import logging
from flask import Flask, render_template, request, jsonify, send_file
from flask_sqlalchemy import SQLAlchemy
from flask_wtf.csrf import CSRFProtect
from flask_cors import CORS
from flask_talisman import Talisman
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from flask_caching import Cache
from bs4 import BeautifulSoup
from dotenv import load_dotenv
from docx import Document
from docx.shared import Pt, Cm
from docx.enum.text import WD_ALIGN_PARAGRAPH
from assets import init_assets

# Configurar logging mais detalhado
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

# Carregar variáveis de ambiente
load_dotenv()

# Initialize Flask app
app = Flask(__name__, static_folder='static', static_url_path='/static')

# Redis configuration
REDIS_URL = os.getenv('REDIS_URL', 'memory://')

# Configurações de segurança
app.config.update(
    SECRET_KEY=os.getenv('SECRET_KEY', os.urandom(32)),
    WTF_CSRF_ENABLED=True,
    WTF_CSRF_CHECK_DEFAULT=True,
    SQLALCHEMY_DATABASE_URI=os.environ['DATABASE_URL'],
    SQLALCHEMY_TRACK_MODIFICATIONS=False,
    SESSION_COOKIE_SECURE=True,
    SESSION_COOKIE_HTTPONLY=True,
    SESSION_COOKIE_SAMESITE='Lax',
    PERMANENT_SESSION_LIFETIME=1800,  # 30 minutos
    RATELIMIT_STORAGE_URL=REDIS_URL,
    CACHE_TYPE="simple",
    CACHE_REDIS_URL=REDIS_URL
)

# Initialize extensions
from models import db, Doctor, Template

# Initialize extensions with app
db.init_app(app)
csrf = CSRFProtect(app)
cache = Cache(app)

# Initialize database
with app.app_context():
    try:
        logger.info("Iniciando criação das tabelas do banco de dados...")
        db.create_all()
        logger.info("Tabelas criadas com sucesso")
    except Exception as e:
        logger.error(f"Erro ao criar tabelas: {e}")
        raise

# Initialize assets
assets = init_assets(app)

# Configurar CORS com opções seguras
CORS(app, resources={
    r"/api/*": {
        "origins": os.getenv('ALLOWED_ORIGINS', '*').split(','),
        "methods": ["GET", "POST", "DELETE"],
        "allow_headers": ["Content-Type", "Authorization", "X-CSRFToken"]
    }
})

# Configurar Talisman para headers de segurança
talisman = Talisman(
    app,
    force_https=False,  # Replit já gerencia HTTPS
    strict_transport_security=True,
    session_cookie_secure=True,
    content_security_policy={
        'default-src': "'self'",
        'img-src': "'self' data:",
        'script-src': "'self' 'unsafe-inline' https://cdn.jsdelivr.net https://code.jquery.com https://stackpath.bootstrapcdn.com https://cdnjs.cloudflare.com",
        'style-src': "'self' 'unsafe-inline' https://cdn.jsdelivr.net https://cdnjs.cloudflare.com",
        'font-src': "'self' https://cdnjs.cloudflare.com",
        'connect-src': "'self'"
    }
)

# Configurar rate limiting
limiter = Limiter(
    app=app,
    key_func=get_remote_address,
    default_limits=["200 per day", "50 per hour"],
    storage_uri=app.config['RATELIMIT_STORAGE_URL']
)

@app.before_request
def log_request_info():
    logger.info(f"Request: {request.method} {request.url}")
    logger.debug(f"Headers: {dict(request.headers)}")

@app.after_request
def log_response_info(response):
    logger.info(f"Response: {response.status}")
    return response

@app.route('/')
def index():
    try:
        doctors = Doctor.query.all()
        templates = Template.query.all()
        return render_template('index.html', doctors=doctors, templates=templates)
    except Exception as e:
        logger.error(f"Erro ao carregar página inicial: {e}")
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

@app.route('/gerar_doc', methods=['POST'])
def gerar_doc():
    try:
        logger.info("Iniciando geração do documento DOC...")
        if not request.is_json:
            return jsonify({"error": "Requisição deve ser JSON"}), 400

        data = request.get_json()
        logger.info("Dados recebidos para geração do documento")

        doc = Document()

        # Configurar margens
        sections = doc.sections
        for section in sections:
            section.top_margin = Cm(2)
            section.bottom_margin = Cm(2)
            section.left_margin = Cm(2.5)
            section.right_margin = Cm(2.5)

        # Título
        title = doc.add_paragraph()
        title.paragraph_format.alignment = WD_ALIGN_PARAGRAPH.CENTER
        title_run = title.add_run("Laudo de Ecodopplercardiograma")
        title_run.font.size = Pt(16)
        title_run.font.bold = True

        # Dados do Paciente
        doc.add_heading("Dados do Paciente", level=2)
        paciente = data.get('paciente', {})
        patient_info = [
            f"Nome: {paciente.get('nome', 'N/D')}",
            f"Data de Nascimento: {paciente.get('dataNascimento', 'N/D')}",
            f"Sexo: {paciente.get('sexo', 'N/D')}",
            f"Peso: {paciente.get('peso', 'N/D')}",
            f"Altura: {paciente.get('altura', 'N/D')}",
            f"Data do Exame: {paciente.get('dataExame', 'N/D')}"
        ]
        for info in patient_info:
            doc.add_paragraph(info)

        # Medidas e Cálculos
        doc.add_heading("Medidas e Cálculos", level=2)
        medidas = data.get('medidas', {})
        calculos = data.get('calculos', {})

        table = doc.add_table(rows=1, cols=4)
        table.style = 'Table Grid'
        header = table.rows[0].cells
        for i, text in enumerate(["Medida", "Valor", "Cálculo", "Resultado"]):
            header[i].text = text

        measure_calc_pairs = [
            ("Átrio Esquerdo", medidas.get('atrio', 'N/D'), "Volume Diastólico Final", calculos.get('volumeDiastFinal', 'N/D')),
            ("Aorta", medidas.get('aorta', 'N/D'), "Volume Sistólico Final", calculos.get('volumeSistFinal', 'N/D')),
            ("Diâmetro Diastólico", medidas.get('diamDiastFinal', 'N/D'), "Volume Ejetado", calculos.get('volumeEjetado', 'N/D')),
            ("Diâmetro Sistólico", medidas.get('diamSistFinal', 'N/D'), "Fração de Ejeção", calculos.get('fracaoEjecao', 'N/D')),
            ("Espessura do Septo", medidas.get('espDiastSepto', 'N/D'), "Percentual Enc. Cavidade", calculos.get('percentEncurt', 'N/D')),
            ("Espessura PPVE", medidas.get('espDiastPPVE', 'N/D'), "Espessura Relativa", calculos.get('espRelativa', 'N/D')),
            ("Ventrículo Direito", medidas.get('vd', 'N/D'), "Massa do VE", calculos.get('massaVE', 'N/D'))
        ]

        for measure, value, calc, result in measure_calc_pairs:
            row = table.add_row().cells
            row[0].text = measure
            row[1].text = value
            row[2].text = calc
            row[3].text = result

        # Laudo
        doc.add_heading("Laudo", level=2)
        if data.get('laudo'):
            soup = BeautifulSoup(data['laudo'], 'html.parser')
            for p in soup.find_all(['p', 'div']):
                if p.get_text().strip():
                    doc.add_paragraph(p.get_text().strip())

        # Dados do Médico
        if data.get('medico'):
            medico = data['medico']
            doc.add_paragraph()  # Espaço em branco
            p = doc.add_paragraph()
            p.alignment = WD_ALIGN_PARAGRAPH.CENTER
            p.add_run(f"{medico['nome']}\n").bold = True
            p.add_run(f"CRM: {medico['crm']}")
            if medico.get('rqe'):
                p.add_run(f"\nRQE: {medico['rqe']}")

        logger.info("Documento gerado, preparando para download...")

        # Salvar documento
        doc_stream = io.BytesIO()
        doc.save(doc_stream)
        doc_stream.seek(0)

        return send_file(
            doc_stream,
            mimetype='application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            as_attachment=True,
            download_name=f"Laudo_{paciente.get('nome', 'laudo').replace(' ', '_')}.docx"
        )

    except Exception as e:
        logger.error(f"Erro ao gerar DOC: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/reports')
def reports():
    doctors = Doctor.query.all()
    templates = Template.query.all()
    return render_template('reports.html', doctors=doctors, templates=templates)

if __name__ == '__main__':
    try:
        port = int(os.environ.get('PORT', 3000))
        if os.getenv('FLASK_ENV') == 'development':
            app.run(host='0.0.0.0', port=port, debug=True)
        else:
            app.run(host='0.0.0.0', port=port, debug=False)
    except Exception as e:
        logger.error(f"Erro ao iniciar aplicação: {e}")