import os
import io
import secrets
import logging
from flask import Flask, render_template, request, jsonify, send_file
from flask_sqlalchemy import SQLAlchemy
from flask_wtf.csrf import CSRFProtect
from flask_caching import Cache
from flask_compress import Compress
from bs4 import BeautifulSoup
from dotenv import load_dotenv
from sqlalchemy import text
try:
    from docx import Document
    from docx.shared import Pt, Cm, RGBColor
    from docx.enum.text import WD_ALIGN_PARAGRAPH, WD_LINE_SPACING
    from docx.oxml import OxmlElement
    from docx.oxml.ns import qn
    print("Módulos python-docx importados com sucesso")
except ImportError as e:
    print(f"Erro ao importar módulos python-docx: {e}")
    raise

from models import db, Doctor, Template

# Configurar logging detalhado
logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

# Configuração do logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

# Carregar variáveis de ambiente
load_dotenv()

# Inicialização do Flask
app = Flask(__name__)

# Configuração das extensões
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SECRET_KEY'] = os.getenv('FLASK_SECRET_KEY', secrets.token_hex(32))
app.config['WTF_CSRF_SECRET_KEY'] = os.getenv('WTF_CSRF_SECRET_KEY', secrets.token_hex(32))
app.config['WTF_CSRF_ENABLED'] = True
app.config['WTF_CSRF_CHECK_DEFAULT'] = True
app.config['CACHE_TYPE'] = 'simple'

# Inicialização das extensões
try:
    print("Iniciando configuração do Flask...")
    
    # Inicializar CSRF primeiro
    csrf = CSRFProtect()
    csrf.init_app(app)
    print("CSRF inicializado com sucesso")
    
    # Outras extensões
    db.init_app(app)
    print("Database inicializado com sucesso")
    
    cache = Cache(app)
    print("Cache inicializado com sucesso")
    
    Compress(app)
    print("Compress inicializado com sucesso")
    
    print("Todas as extensões inicializadas com sucesso!")
except Exception as e:
    print(f"Erro ao inicializar extensões: {str(e)}")
    logger.error(f"Erro detalhado ao inicializar extensões: {str(e)}", exc_info=True)
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

@app.route('/gerar_doc', methods=['POST'])
@csrf.exempt  # Removemos a proteção CSRF desta rota específica já que estamos tratando manualmente
def gerar_doc():
    logger.info("Iniciando rota gerar_doc")
    logger.info(f"Headers recebidos: {dict(request.headers)}")
    """
    Gera um documento DOC com o laudo do paciente.
    Utiliza python-docx para criar o documento e BeautifulSoup para processar o HTML.
    """
    try:
        logger.info("Iniciando função gerar_doc")
        logger.info(f"Headers da requisição: {dict(request.headers)}")
        
        # Verificar se é uma requisição JSON
        if not request.is_json:
            logger.error("Requisição não contém JSON")
            return jsonify({"error": "Requisição deve ser JSON"}), 400
        
        # Obter e validar dados JSON
        try:
            data = request.get_json()
            logger.info(f"Dados recebidos: {str(data)[:500]}...")  # Log primeiros 500 caracteres
        except Exception as e:
            logger.error(f"Erro ao processar JSON da requisição: {str(e)}")
            return jsonify({"error": "JSON inválido"}), 400
            
        if not data:
            logger.error("JSON vazio")
            return jsonify({"error": "JSON vazio"}), 400
            
        required_fields = ['paciente', 'medidas', 'calculos', 'laudo', 'medico']
        missing_fields = [field for field in required_fields if field not in data]
        if missing_fields:
            logger.error(f"Campos obrigatórios faltando: {missing_fields}")
            return jsonify({"error": f"Campos obrigatórios faltando: {missing_fields}"}), 400

        # Importar módulos necessários
        logger.info("Verificando módulos necessários...")
        try:
            # Verificar se os módulos já estão disponíveis
            if not all(var in globals() for var in ['Document', 'Pt', 'Cm', 'RGBColor', 'WD_ALIGN_PARAGRAPH', 'WD_LINE_SPACING']):
                logger.error("Módulos necessários não encontrados")
                return jsonify({"error": "Erro interno do servidor"}), 500
            
            logger.info("Módulos verificados com sucesso")
        except Exception as e:
            logger.error(f"Erro ao verificar módulos: {str(e)}")
            return jsonify({"error": "Erro interno do servidor"}), 500

        logger.info("Iniciando geração do documento")
        data = request.get_json()
        doc = Document()

        def set_cell_border(cell, **kwargs):
            """Define as bordas de uma célula da tabela"""
            tc = cell._tc
            tcPr = tc.get_or_add_tcPr()
            
            for edge in ['top', 'left', 'bottom', 'right']:
                edge_val = kwargs.get(edge, 'single')
                if edge_val:
                    tag = 'w:{}'.format(edge)
                    element = OxmlElement(tag)
                    element.set(qn('w:val'), edge_val)
                    element.set(qn('w:sz'), '4')
                    element.set(qn('w:space'), '0')
                    element.set(qn('w:color'), '000000')
                    tcPr.append(element)

        # Configurar margens e orientação do documento
        sections = doc.sections
        for section in sections:
            section.top_margin = Cm(2)
            section.bottom_margin = Cm(2)
            section.left_margin = Cm(2.5)
            section.right_margin = Cm(2.5)
            section.page_height = Cm(29.7)  # A4
            section.page_width = Cm(21.0)   # A4

        logger.info("Configurando título do documento")
        # Título
        title = doc.add_paragraph()
        title_format = title.paragraph_format
        title_format.alignment = WD_ALIGN_PARAGRAPH.CENTER
        title_format.space_before = Pt(0)
        title_format.space_after = Pt(20)
        title_run = title.add_run("Laudo de Ecodopplercardiograma")
        title_run.font.size = Pt(16)
        title_run.font.bold = True
        title_run.font.name = 'Arial'

        logger.info("Adicionando dados do paciente")
        # Dados do Paciente
        patient_heading = doc.add_heading(level=2)
        patient_run = patient_heading.add_run("Dados do Paciente")
        patient_run.font.size = Pt(13)
        patient_run.font.name = 'Arial'

        patient_data = [
            ("Nome", data['paciente']['nome']),
            ("Data Nascimento", data['paciente']['dataNascimento']),
            ("Sexo", data['paciente']['sexo']),
            ("Peso", f"{data['paciente']['peso']} kg" if data['paciente']['peso'] else 'N/D'),
            ("Altura", f"{data['paciente']['altura']} cm" if data['paciente']['altura'] else 'N/D'),
            ("Data do Exame", data['paciente']['dataExame'])
        ]

        table = doc.add_table(rows=1, cols=2)
        table.style = 'Table Grid'
        table.autofit = True

        header_cells = table.rows[0].cells
        for i, cell in enumerate(header_cells):
            # Aplicar formatação às células
            set_cell_border(cell)
            cell.paragraphs[0].alignment = WD_ALIGN_PARAGRAPH.CENTER
            run = cell.paragraphs[0].add_run(["Campo", "Valor"][i])
            run.font.bold = True
            run.font.size = Pt(11)
            run.font.name = 'Arial'

        for label, value in patient_data:
            row = table.add_row().cells
            for cell in row:
                set_cell_border(cell)
            row[0].text = label
            row[1].text = value if value else 'N/D'
            # Formatar fonte
            for paragraph in row[0].paragraphs:
                for run in paragraph.runs:
                    run.font.size = Pt(11)
                    run.font.name = 'Arial'
            for paragraph in row[1].paragraphs:
                for run in paragraph.runs:
                    run.font.size = Pt(11)
                    run.font.name = 'Arial'

        doc.add_paragraph().add_run().add_break()

        logger.info("Adicionando medidas e cálculos")
        # Medidas e Cálculos
        measures_heading = doc.add_heading(level=2)
        measures_run = measures_heading.add_run("Medidas e Cálculos")
        measures_run.font.size = Pt(13)
        measures_run.font.name = 'Arial'

        measures_table = doc.add_table(rows=1, cols=4)
        measures_table.style = 'Table Grid'
        measures_table.autofit = True

        # Cabeçalho da tabela
        header = measures_table.rows[0].cells
        header_texts = ["Medida", "Valor", "Cálculo", "Resultado"]
        for i, cell in enumerate(header):
            set_cell_border(cell)
            cell.paragraphs[0].alignment = WD_ALIGN_PARAGRAPH.CENTER
            run = cell.paragraphs[0].add_run(header_texts[i])
            run.font.bold = True
            run.font.size = Pt(11)
            run.font.name = 'Arial'

        # Dados da tabela
        measures_data = [
            ("Átrio Esquerdo", data['medidas']['atrio'], "Volume Diastólico Final", data['calculos']['volumeDiastFinal']),
            ("Aorta", data['medidas']['aorta'], "Volume Sistólico Final", data['calculos']['volumeSistFinal']),
            ("Diâmetro Diastólico", data['medidas']['diamDiastFinal'], "Volume Ejetado", data['calculos']['volumeEjetado']),
            ("Diâmetro Sistólico", data['medidas']['diamSistFinal'], "Fração de Ejeção", data['calculos']['fracaoEjecao']),
            ("Espessura do Septo", data['medidas']['espDiastSepto'], "Percentual Enc. Cavidade", data['calculos']['percentEncurt']),
            ("Espessura PPVE", data['medidas']['espDiastPPVE'], "Espessura Relativa", data['calculos']['espRelativa']),
            ("Ventrículo Direito", data['medidas']['vd'], "Massa do VE", data['calculos']['massaVE'])
        ]

        for measure in measures_data:
            row = measures_table.add_row().cells
            for i, value in enumerate(row):
                set_cell_border(value)
                value.text = str(measure[i] if measure[i] else 'N/D')
                for paragraph in value.paragraphs:
                    for run in paragraph.runs:
                        run.font.size = Pt(11)
                        run.font.name = 'Arial'

        doc.add_paragraph().add_run().add_break()

        logger.info("Processando o laudo")
        # Laudo
        report_heading = doc.add_heading(level=2)
        report_run = report_heading.add_run("Laudo")
        report_run.font.size = Pt(13)
        report_run.font.name = 'Arial'

        logger.info("Processando o conteúdo HTML do laudo")
        try:
            if not data.get('laudo'):
                logger.error("Conteúdo do laudo está vazio")
                return jsonify({"error": "Conteúdo do laudo não pode estar vazio"}), 400
                
            logger.info(f"Conteúdo do laudo recebido: {data['laudo'][:100]}...")
            soup = BeautifulSoup(data['laudo'], 'html.parser')
            
            if not soup or not soup.find_all(['p', 'div']):
                logger.error("HTML do laudo inválido ou vazio")
                return jsonify({"error": "Formato do laudo inválido"}), 400
                
            logger.info("HTML do laudo processado com sucesso")
            logger.info(f"Elementos encontrados: {len(soup.find_all(['p', 'div']))} parágrafos/divs")
        except Exception as e:
            logger.error(f"Erro ao processar HTML com BeautifulSoup: {str(e)}", exc_info=True)
            return jsonify({"error": "Erro ao processar o formato do laudo"}), 500

        def process_paragraph_alignment(p_tag):
            """Determina o alinhamento do parágrafo baseado no estilo HTML"""
            try:
                style = p_tag.get('style', '')
                if 'text-align: center' in style:
                    return WD_ALIGN_PARAGRAPH.CENTER
                elif 'text-align: right' in style:
                    return WD_ALIGN_PARAGRAPH.RIGHT
                elif 'text-align: justify' in style:
                    return WD_ALIGN_PARAGRAPH.JUSTIFY
                return WD_ALIGN_PARAGRAPH.LEFT
            except Exception as e:
                logger.error(f"Erro ao processar alinhamento: {str(e)}")
                return WD_ALIGN_PARAGRAPH.LEFT

        def process_text_formatting(element, paragraph):
            """Processa a formatação do texto mantendo estilos aninhados"""
            if isinstance(element, str):
                run = paragraph.add_run(element)
                run.font.size = Pt(12)
                run.font.name = 'Arial'
                return

            if element.name in ['strong', 'b']:
                run = paragraph.add_run(element.get_text())
                run.bold = True
            elif element.name in ['em', 'i']:
                run = paragraph.add_run(element.get_text())
                run.italic = True
            elif element.name == 'u':
                run = paragraph.add_run(element.get_text())
                run.underline = True
            elif element.name == 'br':
                paragraph.add_run().add_break()
            else:
                for child in element.children:
                    process_text_formatting(child, paragraph)

            # Aplicar fonte padrão
            for run in paragraph.runs:
                run.font.size = Pt(12)
                run.font.name = 'Arial'

        # Processar o conteúdo do laudo mantendo a formatação
        for p in soup.find_all(['p', 'div']):
            if 'medical-signature' in p.get('class', []):
                logger.info("Processando assinatura médica")
                # Adicionar espaço antes da assinatura
                doc.add_paragraph().add_run().add_break()
                
                # Adicionar linha para assinatura
                signature_line = doc.add_paragraph()
                signature_line.paragraph_format.alignment = WD_ALIGN_PARAGRAPH.RIGHT
                signature_line.paragraph_format.space_before = Pt(24)  # 2cm aproximadamente
                
                # Adicionar informações do médico
                doctor_info = [
                    (f"Dr(a). {data['medico']['nome']}", True),
                    (f"CRM: {data['medico']['crm']}", False)
                ]
                
                if data['medico']['rqe']:
                    doctor_info.append((f"RQE: {data['medico']['rqe']}", False))

                for info, is_bold in doctor_info:
                    p = doc.add_paragraph()
                    p.paragraph_format.alignment = WD_ALIGN_PARAGRAPH.RIGHT
                    run = p.add_run(info)
                    run.font.bold = is_bold
                    run.font.size = Pt(12)
                    run.font.name = 'Arial'
            else:
                paragraph = doc.add_paragraph()
                paragraph.paragraph_format.alignment = process_paragraph_alignment(p)
                paragraph.paragraph_format.line_spacing_rule = WD_LINE_SPACING.SINGLE
                
                for element in p.children:
                    process_text_formatting(element, paragraph)

        logger.info("Salvando o documento")
        # Salvar o documento
        doc_stream = io.BytesIO()
        doc.save(doc_stream)
        doc_stream.seek(0)

        logger.info("Documento gerado com sucesso")
        try:
            logger.info("Preparando arquivo para download")
            response = send_file(
                doc_stream,
                mimetype='application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                as_attachment=True,
                download_name=f"Laudo_{data['paciente']['nome'].replace(' ', '_')}.docx"
            )
            logger.info("Arquivo preparado com sucesso")
            return response
        except Exception as e:
            logger.error(f"Erro ao enviar arquivo: {str(e)}")
            return jsonify({"error": "Erro ao gerar arquivo para download"}), 500

    except Exception as e:
        logger.error(f"Erro ao gerar DOC: {str(e)}", exc_info=True)
        return jsonify({"error": str(e)}), 500

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
