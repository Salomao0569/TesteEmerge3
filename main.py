import os
import logging
from flask import Flask, render_template, request, jsonify, send_file
from flask_sqlalchemy import SQLAlchemy
from flask_wtf.csrf import CSRFProtect, generate_csrf
from models import db, Doctor, Template, Report
from dotenv import load_dotenv
from datetime import datetime
from assets import init_assets
from docx import Document
from docx.shared import Inches, Pt
from io import BytesIO
import html2text

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
        init_assets(app)  # Inicializa o gerenciamento de assets
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

@app.route('/gerar_doc', methods=['POST'])
def gerar_doc():
    try:
        data = request.get_json()
        doc = Document()

        # Configuração inicial do documento
        doc.add_heading('Laudo de Ecodopplercardiograma', 0)

        # Dados do Paciente
        doc.add_heading('Dados do Paciente', level=1)
        table = doc.add_table(rows=1, cols=2)
        table.style = 'Table Grid'

        # Cabeçalhos da tabela
        header_cells = table.rows[0].cells
        header_cells[0].text = 'Campo'
        header_cells[1].text = 'Valor'

        # Adicionar dados do paciente
        paciente = data.get('paciente', {})
        dados_paciente = [
            ('Nome', paciente.get('nome', 'N/D')),
            ('Data de Nascimento', paciente.get('dataNascimento', 'N/D')),
            ('Sexo', paciente.get('sexo', 'N/D')),
            ('Peso', paciente.get('peso', 'N/D')),
            ('Altura', paciente.get('altura', 'N/D')),
            ('Data do Exame', paciente.get('dataExame', 'N/D'))
        ]

        for campo, valor in dados_paciente:
            row_cells = table.add_row().cells
            row_cells[0].text = campo
            row_cells[1].text = str(valor)

        # Medidas e Cálculos
        doc.add_heading('Medidas e Cálculos', level=1)
        table = doc.add_table(rows=1, cols=4)
        table.style = 'Table Grid'

        # Cabeçalhos
        header_cells = table.rows[0].cells
        header_cells[0].text = 'Medida'
        header_cells[1].text = 'Valor'
        header_cells[2].text = 'Cálculo'
        header_cells[3].text = 'Resultado'

        medidas = data.get('medidas', {})
        calculos = data.get('calculos', {})

        medidas_calculos = [
            ('Átrio Esquerdo', medidas.get('atrio', 'N/D'), 
             'Volume Diastólico Final', calculos.get('volumeDiastFinal', 'N/D')),
            ('Aorta', medidas.get('aorta', 'N/D'), 
             'Volume Sistólico Final', calculos.get('volumeSistFinal', 'N/D')),
            ('Diâmetro Diastólico', medidas.get('diamDiastFinal', 'N/D'), 
             'Volume Ejetado', calculos.get('volumeEjetado', 'N/D')),
            ('Diâmetro Sistólico', medidas.get('diamSistFinal', 'N/D'), 
             'Fração de Ejeção', calculos.get('fracaoEjecao', 'N/D')),
            ('Espessura do Septo', medidas.get('espDiastSepto', 'N/D'),
             'Percentual Enc. Cavidade', calculos.get('percentEncurt', 'N/D')),
            ('Espessura PPVE', medidas.get('espDiastPPVE', 'N/D'),
             'Espessura Relativa', calculos.get('espRelativa', 'N/D')),
            ('Ventrículo Direito', medidas.get('vd', 'N/D'),
             'Massa do VE', calculos.get('massaVE', 'N/D'))
        ]

        for medida, valor_medida, calculo, valor_calculo in medidas_calculos:
            row_cells = table.add_row().cells
            row_cells[0].text = medida
            row_cells[1].text = str(valor_medida)
            row_cells[2].text = calculo
            row_cells[3].text = str(valor_calculo)

        # Laudo
        doc.add_heading('Laudo', level=1)
        h = html2text.HTML2Text()
        h.ignore_links = True
        laudo_texto = h.handle(data.get('laudo', ''))
        doc.add_paragraph(laudo_texto)

        # Assinatura do Médico
        if data.get('medico'):
            doc.add_paragraph('\n\n')
            medico = data['medico']
            assinatura = f"{medico['nome']}\nCRM: {medico['crm']}"
            if medico.get('rqe'):
                assinatura += f"\nRQE: {medico['rqe']}"
            doc.add_paragraph(assinatura).alignment = 1  # Centralizado

        # Salvar documento
        doc_io = BytesIO()
        doc.save(doc_io)
        doc_io.seek(0)

        return send_file(
            doc_io,
            mimetype='application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            as_attachment=True,
            download_name='laudo_ecocardiograma.docx'
        )

    except Exception as e:
        logger.error(f"Erro ao gerar documento DOC: {str(e)}", exc_info=True)
        return jsonify({"error": str(e)}), 500

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
    app.run(host='0.0.0.0', port=3001, debug=True)