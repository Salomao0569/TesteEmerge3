import os
import logging
from flask import Flask, render_template, request, jsonify, send_file, session
from flask_wtf.csrf import CSRFProtect, generate_csrf
from models import db, Doctor, Template, Report
from dotenv import load_dotenv
from datetime import datetime
from assets import init_assets
from docx import Document
from docx.shared import Inches, Pt
from io import BytesIO
import html2text
from openai import OpenAI
import json
from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle

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

    try:
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
            WTF_CSRF_SECRET_KEY=os.environ.get('WTF_CSRF_SECRET_KEY', os.urandom(32)),
            WTF_CSRF_CHECK_DEFAULT=True,
            SESSION_COOKIE_SECURE=True,
            SESSION_COOKIE_HTTPONLY=True,
            REMEMBER_COOKIE_SECURE=True,
            REMEMBER_COOKIE_HTTPONLY=True
        )

        # Inicializar extensões com tratamento de erro detalhado
        logger.info("Inicializando extensões do Flask...")
        db.init_app(app)
        csrf = CSRFProtect()
        csrf.init_app(app)
        init_assets(app)
        logger.info("Extensões inicializadas com sucesso")

        return app
    except Exception as e:
        logger.error(f"Erro crítico ao inicializar aplicação: {str(e)}", exc_info=True)
        raise

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

@app.route('/doctors')
def doctors():
    try:
        logger.info("Acessando página de médicos")
        doctors = Doctor.query.all()
        logger.info(f"Encontrados {len(doctors)} médicos")
        return render_template('doctors.html', doctors=doctors)
    except Exception as e:
        logger.error(f"Erro ao carregar página de médicos: {str(e)}", exc_info=True)
        return "Erro ao carregar página de médicos", 500

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
        logger.error(f"Erro ao buscar templates: {str(e)}", exc_info=True)
        return jsonify({"error": str(e)}), 500

@app.route('/api/templates', methods=['POST'])
def create_template():
    """Create a new template with enhanced error handling and logging"""
    try:
        if not request.is_json:
            logger.error("Requisição não contém Content-Type: application/json")
            return jsonify({"error": "Content-Type deve ser application/json"}), 400

        data = request.get_json()
        logger.debug(f"Dados recebidos para criar template: {data}")

        # Validar dados obrigatórios
        if not data.get('name'):
            logger.error("Tentativa de criar template sem título")
            return jsonify({"error": "Título é obrigatório"}), 400

        if not data.get('content'):
            logger.error("Tentativa de criar template sem conteúdo")
            return jsonify({"error": "Conteúdo é obrigatório"}), 400

        category = data.get('category', 'mascara')
        logger.info(f"Criando novo template com categoria: {category}")

        new_template = Template(
            name=data['name'],
            content=data['content'],
            category=category,
            doctor_id=data.get('doctor_id')
        )

        db.session.add(new_template)
        db.session.commit()
        logger.info(f"Template criado com sucesso: ID {new_template.id}")

        return jsonify({
            "message": "Template salvo com sucesso",
            "template": new_template.to_dict()
        }), 201

    except Exception as e:
        db.session.rollback()
        logger.error(f"Erro ao criar template: {str(e)}", exc_info=True)
        return jsonify({"error": f"Erro ao salvar template: {str(e)}"}), 400

@app.route('/api/doctors', methods=['GET'])
def get_doctors():
    try:
        doctors = Doctor.query.all()
        return jsonify([doctor.to_dict() for doctor in doctors])
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/doctors/<int:id>', methods=['PUT'])
def update_doctor(id):
    try:
        doctor = Doctor.query.get_or_404(id)
        data = request.get_json()

        # Validar dados
        if not data.get('full_name'):
            return jsonify({"error": "Nome completo é obrigatório"}), 400
        if not data.get('crm'):
            return jsonify({"error": "CRM é obrigatório"}), 400

        # Verificar se o CRM já existe para outro médico
        existing_doctor = Doctor.query.filter(Doctor.crm == data['crm'], Doctor.id != id).first()
        if existing_doctor:
            return jsonify({"error": "CRM já cadastrado para outro médico"}), 400

        # Atualizar dados
        doctor.full_name = data['full_name']
        doctor.crm = data['crm']
        doctor.rqe = data.get('rqe', '')

        db.session.commit()
        return jsonify(doctor.to_dict())
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 400

@app.route('/api/doctors/<int:id>', methods=['DELETE'])
def delete_doctor(id):
    try:
        doctor = Doctor.query.get_or_404(id)

        # Verificar se o médico tem laudos ou templates associados
        if doctor.reports or doctor.templates:
            return jsonify({
                "error": "Não é possível excluir o médico pois existem laudos ou templates associados"
            }), 400

        db.session.delete(doctor)
        db.session.commit()
        return jsonify({"message": "Médico excluído com sucesso"})
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 400

@app.route('/api/doctors', methods=['POST'])
def create_doctor():
    """Create a new doctor with enhanced error handling and validation"""
    try:
        if not request.is_json:
            logger.error("Request Content-Type is not application/json")
            return jsonify({
                "error": "Content-Type deve ser application/json"
            }), 400

        data = request.get_json()
        logger.info(f"Tentativa de criar médico com dados: {data}")

        # Validação dos campos obrigatórios
        if not data.get('full_name'):
            logger.error("Tentativa de criar médico sem nome")
            return jsonify({"error": "Nome completo é obrigatório"}), 400
        if not data.get('crm'):
            logger.error("Tentativa de criar médico sem CRM")
            return jsonify({"error": "CRM é obrigatório"}), 400

        # Validação do CRM existente
        existing_doctor = Doctor.query.filter_by(crm=data['crm']).first()
        if existing_doctor:
            logger.error(f"Tentativa de criar médico com CRM já existente: {data['crm']}")
            return jsonify({"error": "CRM já cadastrado"}), 400

        # Criar novo médico
        new_doctor = Doctor(
            full_name=data['full_name'],
            crm=data['crm'],
            rqe=data.get('rqe', '')
        )

        db.session.add(new_doctor)
        db.session.commit()
        logger.info(f"Médico criado com sucesso: ID {new_doctor.id}")

        return jsonify({
            "message": "Médico cadastrado com sucesso",
            "doctor": new_doctor.to_dict()
        }), 201

    except Exception as e:
        db.session.rollback()
        logger.error(f"Erro ao criar médico: {str(e)}", exc_info=True)
        return jsonify({"error": f"Erro ao criar médico: {str(e)}"}), 500

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
        logger.info("Iniciando geração do documento DOC")
        logger.debug("Dados recebidos: %s", data)

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
        logger.info("Processando dados do paciente: %s", paciente)

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
        logger.info("Processando medidas e cálculos")

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
        logger.info("Documento DOC gerado com sucesso")

        return send_file(
            doc_io,
            mimetype='application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            as_attachment=True,
            download_name='laudo_ecocardiograma.docx'
        )

    except Exception as e:
        logger.error(f"Erro ao gerar documento DOC: {str(e)}", exc_info=True)
        return jsonify({"error": str(e)}), 500

@app.route('/gerar_pdf', methods=['POST'])
def gerar_pdf():
    try:
        data = request.get_json()
        logger.info("Iniciando geração do PDF")
        logger.debug("Dados recebidos: %s", data)

        # Criar PDF em memória
        buffer = BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=letter)
        styles = getSampleStyleSheet()
        story = []

        # Título
        title_style = ParagraphStyle(
            'CustomTitle',
            parent=styles['Heading1'],
            fontSize=16,
            spaceAfter=30
        )
        story.append(Paragraph('Laudo de Ecodopplercardiograma', title_style))

        # Dados do Paciente
        paciente = data.get('paciente', {})
        logger.info("Processando dados do paciente: %s", paciente)
        dados_paciente = [
            ['Campo', 'Valor'],
            ['Nome', paciente.get('nome', 'N/D')],
            ['Data de Nascimento', paciente.get('dataNascimento', 'N/D')],
            ['Sexo', paciente.get('sexo', 'N/D')],
            ['Peso', paciente.get('peso', 'N/D')],
            ['Altura', paciente.get('altura', 'N/D')],
            ['Data do Exame', paciente.get('dataExame', 'N/D')]
        ]

        t = Table(dados_paciente)
        t.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 12),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('BACKGROUND', (0, 1), (-1, -1), colors.white),
            ('TEXTCOLOR', (0, 1), (-1, -1), colors.black),
            ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
            ('FONTSIZE', (0, 1), (-1, -1), 10),
            ('GRID', (0, 0), (-1, -1), 1, colors.black),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('TOPPADDING', (0, 1), (-1, -1), 6),
            ('BOTTOMPADDING', (0, 1), (-1, -1), 6),
        ]))
        story.append(t)
        story.append(Spacer(1, 20))

        # Medidas e Cálculos
        story.append(Paragraph('Medidas e Cálculos', styles['Heading2']))
        medidas = data.get('medidas', {})
        calculos = data.get('calculos', {})
        logger.info("Processando medidas e cálculos")

        medidas_calculos = [
            ['Medida', 'Valor', 'Cálculo', 'Resultado'],
            ['Átrio Esquerdo', medidas.get('atrio', 'N/D'), 
             'Volume Diastólico Final', calculos.get('volumeDiastFinal', 'N/D')],
            ['Aorta', medidas.get('aorta', 'N/D'), 
             'Volume Sistólico Final', calculos.get('volumeSistFinal', 'N/D')],
            ['Diâmetro Diastólico', medidas.get('diamDiastFinal', 'N/D'), 
             'Volume Ejetado', calculos.get('volumeEjetado', 'N/D')],
            ['Diâmetro Sistólico', medidas.get('diamSistFinal', 'N/D'), 
             'Fração de Ejeção', calculos.get('fracaoEjecao', 'N/D')],
            ['Espessura do Septo', medidas.get('espDiastSepto', 'N/D'),
             'Percentual Enc. Cavidade', calculos.get('percentEncurt', 'N/D')],
            ['Espessura PPVE', medidas.get('espDiastPPVE', 'N/D'),
             'Espessura Relativa', calculos.get('espRelativa', 'N/D')],
            ['Ventrículo Direito', medidas.get('vd', 'N/D'),
             'Massa do VE', calculos.get('massaVE', 'N/D')]
        ]

        t = Table(medidas_calculos)
        t.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 12),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('BACKGROUND', (0, 1), (-1, -1), colors.white),
            ('TEXTCOLOR', (0, 1), (-1, -1), colors.black),
            ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
            ('FONTSIZE', (0, 1), (-1, -1), 10),
            ('GRID', (0, 0), (-1, -1), 1, colors.black),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('TOPPADDING', (0, 1), (-1, -1), 6),
            ('BOTTOMPADDING', (0, 1), (-1, -1), 6),
        ]))
        story.append(t)
        story.append(Spacer(1, 20))

        # Laudo
        story.append(Paragraph('Laudo', styles['Heading2']))
        h = html2text.HTML2Text()
        h.ignore_links = True
        laudo_texto = h.handle(data.get('laudo', ''))
        story.append(Paragraph(laudo_texto, styles['Normal']))

        # Assinatura do Médico
        if data.get('medico'):
            story.append(Spacer(1, 30))
            medico = data['medico']
            assinatura = f"{medico['nome']}\nCRM: {medico['crm']}"
            if medico.get('rqe'):
                assinatura += f"\nRQE: {medico['rqe']}"
            story.append(Paragraph(assinatura, styles['Normal']))

        # Gerar PDF
        doc.build(story)
        buffer.seek(0)
        logger.info("PDF gerado com sucesso")

        return send_file(
            buffer,
            mimetype='application/pdf',
            as_attachment=True,
            download_name='laudo_ecocardiograma.pdf'
        )

    except Exception as e:
        logger.error(f"Erro ao gerar PDF: {str(e)}", exc_info=True)
        return jsonify({"error": str(e)}), 500

@app.route('/api/phrases', methods=['POST'])
def save_phrase():
    """Save a new phrase or template"""
    try:
        if not request.is_json:
            logger.error("Requisição não contém Content-Type: application/json")
            return jsonify({"error": "Content-Type deve ser application/json"}), 400

        data = request.get_json()
        logger.debug(f"Dados recebidos para salvar frase: {data}")

        if not data.get('content'):
            logger.error("Tentativa de salvar frase sem conteúdo")
            return jsonify({"error": "Conteúdo é obrigatório"}), 400

        if not data.get('title'):
            logger.error("Tentativa de salvar frase sem título")
            return jsonify({"error": "Título é obrigatório"}), 400

        new_template = Template(
            name=data['title'],
            content=data['content'],
            category='mascara',  # Sempre salvar como máscara
            doctor_id=data.get('doctor_id')
        )

        db.session.add(new_template)
        db.session.commit()
        logger.info(f"Nova máscara salva com sucesso: ID {new_template.id}")

        return jsonify({
            "message": "Máscara salva com sucesso",
            "template": new_template.to_dict()
        }), 201

    except Exception as e:
        db.session.rollback()
        logger.error(f"Erro ao salvar máscara: {str(e)}", exc_info=True)
        return jsonify({"error": str(e)}), 400

@app.route('/api/phrases', methods=['GET'])
def list_phrases():
    try:
        phrases = Template.query.filter_by(category='frase').all()
        return jsonify([phrase.to_dict() for phrase in phrases])
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/phrases/<int:id>', methods=['DELETE'])
def delete_phrase(id):
    try:
        phrase = Template.query.filter_by(id=id, category='frase').first_or_404()
        db.session.delete(phrase)
        db.session.commit()
        return jsonify({"message": "Frase excluída com sucesso"})
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 400


@app.route('/api/templates/<int:id>', methods=['DELETE'])
def delete_template(id):
    """Delete a template with enhanced error handling and logging"""
    try:
        template = Template.query.get_or_404(id)
        template_name = template.name  # Store name for logging

        db.session.delete(template)
        db.session.commit()

        logger.info(f"Template '{template_name}' (ID: {id}) excluído com sucesso")
        return jsonify({"message": "Template excluído com sucesso"}), 200

    except Exception as e:
        db.session.rollback()
        logger.error(f"Erro ao excluir template {id}: {str(e)}", exc_info=True)
        return jsonify({"error": f"Erro ao excluir template: {str(e)}"}), 400

@app.route('/phrases')
def phrases():
    return render_template('phrases.html')

@app.after_request
def add_csrf_header(response):
    """Add CSRF token to response headers and cookies"""
    if 'text/html' in response.headers.get('Content-Type', ''):
        csrf_token = generate_csrf()
        response.headers.set('X-CSRF-Token', csrf_token)
        response.set_cookie('csrf_token', csrf_token, secure=True, httponly=True, samesite='Strict')
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

    port = int(os.environ.get('PORT', 3001))
    app.run(host='0.0.0.0', port=port, debug=True)