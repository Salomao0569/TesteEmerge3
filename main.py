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

# Configuração PostgreSQL
database_url = os.environ.get('DATABASE_URL')
if not database_url:
    raise Exception("DATABASE_URL não encontrada nas variáveis de ambiente")

app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://biocardio:biocardio86@34.95.184.194:5432/biocardio'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SQLALCHEMY_ENGINE_OPTIONS'] = {
    'pool_size': 5,
    'pool_timeout': 30,
    'pool_recycle': 1800,
    'connect_args': {
        'connect_timeout': 10,
        'sslmode': 'disable'
    }
}

# Log da tentativa de conexão
app.logger.info("Tentando conectar ao PostgreSQL...")
try:
    db.create_all()
    app.logger.info("Conexão com PostgreSQL estabelecida com sucesso!")
except Exception as e:
    app.logger.error(f"Erro ao conectar com PostgreSQL: {str(e)}")

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
        if not request.is_json:
            return jsonify({'error': 'Dados devem ser enviados em formato JSON'}), 400

        data = request.json
        if not data.get('full_name'):
            return jsonify({'error': 'Nome do médico é obrigatório'}), 400
        if not data.get('crm'):
            return jsonify({'error': 'CRM é obrigatório'}), 400

        # Verifica se já existe médico com o mesmo CRM
        existing_doctor = Doctor.query.filter_by(crm=data['crm']).first()
        if existing_doctor:
            return jsonify({'error': 'Já existe um médico cadastrado com este CRM'}), 400

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

@app.route('/api/laudos', methods=['POST'])
def criar_laudo():
    try:
        data = request.json
        laudo = Laudo(
            data_exame=datetime.strptime(data['dataExame'], '%Y-%m-%d'),
            paciente_nome=data['paciente']['nome'],
            paciente_data_nascimento=datetime.strptime(data['paciente']['dataNascimento'], '%d/%m/%Y').date() if data['paciente']['dataNascimento'] else None,
            paciente_sexo=data['paciente']['sexo'],
            peso=float(data['paciente']['peso']),
            altura=float(data['paciente']['altura']),
            medidas=data['medidas'],
            calculos=data['calculos'],
            conteudo=data['laudo'],
            doctor_id=data['medico']['id']
        )
        db.session.add(laudo)
        db.session.commit()
        return jsonify(laudo.to_dict()), 201
    except Exception as e:
        db.session.rollback()
        app.logger.error(f"Erro ao criar laudo: {str(e)}")
        return jsonify({'error': str(e)}), 400

@app.route('/gerar_doc', methods=['POST'])
def gerar_doc():
    try:
        data = request.json
        doc = Document()
        
        # Título
        doc.add_heading('Laudo de Ecodopplercardiograma', 0)
        
        # Dados do Paciente
        doc.add_heading('Dados do Paciente', level=1)
        table = doc.add_table(rows=1, cols=2)
        table.style = 'Table Grid'
        for row in [
            ('Nome', data['paciente']['nome']),
            ('Data Nascimento', data['paciente']['dataNascimento']),
            ('Sexo', data['paciente']['sexo']),
            ('Peso', f"{data['paciente']['peso']} kg"),
            ('Altura', f"{data['paciente']['altura']} cm"),
            ('Data do Exame', data['paciente']['dataExame'])
        ]:
            cells = table.add_row().cells
            cells[0].text = row[0]
            cells[1].text = str(row[1])

        # Medidas e Cálculos
        doc.add_heading('Medidas e Cálculos', level=1)
        table = doc.add_table(rows=1, cols=4)
        table.style = 'Table Grid'
        header_cells = table.rows[0].cells
        header_cells[0].text = 'Medida'
        header_cells[1].text = 'Valor'
        header_cells[2].text = 'Cálculo'
        header_cells[3].text = 'Resultado'
        
        medidas_calculos = [
            ('Átrio Esquerdo', data['medidas']['atrio'], 'Volume Diastólico Final', data['calculos']['volumeDiastFinal']),
            ('Aorta', data['medidas']['aorta'], 'Volume Sistólico Final', data['calculos']['volumeSistFinal']),
            ('Diâmetro Diastólico', data['medidas']['diamDiastFinal'], 'Volume Ejetado', data['calculos']['volumeEjetado']),
            ('Diâmetro Sistólico', data['medidas']['diamSistFinal'], 'Fração de Ejeção', data['calculos']['fracaoEjecao']),
            ('Espessura do Septo', data['medidas']['espDiastSepto'], 'Percentual Enc. Cavidade', data['calculos']['percentEncurt']),
            ('Espessura PPVE', data['medidas']['espDiastPPVE'], 'Espessura Relativa', data['calculos']['espRelativa']),
            ('Ventrículo Direito', data['medidas']['vd'], 'Massa do VE', data['calculos']['massaVE'])
        ]
        
        for row_data in medidas_calculos:
            cells = table.add_row().cells
            for i, value in enumerate(row_data):
                cells[i].text = str(value)

        # Laudo
        doc.add_heading('Laudo', level=1)
        h = html2text.HTML2Text()
        h.body_width = 0
        laudo_texto = h.handle(data['laudo'])
        doc.add_paragraph(laudo_texto)
        
        # Assinatura do Médico
        doc.add_paragraph('\n\n')
        doc.add_paragraph('_' * 40, style='Heading 1')
        doc.add_paragraph(data['medico']['nome'])
        doc.add_paragraph(f"CRM: {data['medico']['crm']}" + (f" / RQE: {data['medico']['rqe']}" if data['medico']['rqe'] else ""))
        
        # Salvar documento
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