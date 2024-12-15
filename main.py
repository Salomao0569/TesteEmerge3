from flask import Flask, render_template, request, jsonify, send_file
from models import db, Doctor, Template
import os
import io
from docx import Document
from docx.shared import Pt, Inches
from docx.enum.text import WD_ALIGN_PARAGRAPH, WD_LINE_SPACING
from bs4 import BeautifulSoup
from dotenv import load_dotenv

app = Flask(__name__)

# Configuração do banco de dados
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SECRET_KEY'] = os.getenv('FLASK_SECRET_KEY', 'your-secret-key')

# Inicialização do banco de dados
db.init_app(app)
with app.app_context():
    db.create_all()

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
    return render_template('doctors.html')

@app.route('/templates')
def templates():
    return render_template('templates.html')

#Example route for generating a DOCX report.  This needs to be adapted to your actual application
@app.route('/gerar_doc', methods=['POST'])
def gerar_doc():
    try:
        data = request.get_json()
        doc = Document()
        
        # Configurar margens
        sections = doc.sections
        for section in sections:
            section.top_margin = Inches(1)
            section.bottom_margin = Inches(1)
            section.left_margin = Inches(1)
            section.right_margin = Inches(1)

        # Adicionar dados do paciente
        doc.add_heading('Dados do Paciente', level=1)
        table = doc.add_table(rows=1, cols=2)
        table.style = 'Table Grid'
        row = table.rows[0].cells
        row[0].text = f"Nome: {data['paciente']['nome']}"
        row[1].text = f"Data Nascimento: {data['paciente']['dataNascimento']}"
        
        # Adicionar medidas
        doc.add_heading('Medidas', level=1)
        medidas_table = doc.add_table(rows=8, cols=2)
        medidas_table.style = 'Table Grid'
        medidas = [
            ('Átrio Esquerdo', data['medidas']['atrio']),
            ('Aorta', data['medidas']['aorta']),
            ('Diâmetro Diastólico Final', data['medidas']['diamDiastFinal']),
            ('Diâmetro Sistólico Final', data['medidas']['diamSistFinal']),
            ('Espessura do Septo', data['medidas']['espDiastSepto']),
            ('Espessura da PPVE', data['medidas']['espDiastPPVE']),
            ('Ventrículo Direito', data['medidas']['vd'])
        ]
        
        for i, (label, value) in enumerate(medidas):
            cells = medidas_table.rows[i].cells
            cells[0].text = label
            cells[1].text = str(value)
            
        # Adicionar cálculos
        doc.add_heading('Cálculos', level=1)
        calculos_table = doc.add_table(rows=7, cols=2)
        calculos_table.style = 'Table Grid'
        calculos = [
            ('Volume Diastólico Final', data['calculos']['volumeDiastFinal']),
            ('Volume Sistólico Final', data['calculos']['volumeSistFinal']),
            ('Volume Ejetado', data['calculos']['volumeEjetado']),
            ('Fração de Ejeção', data['calculos']['fracaoEjecao']),
            ('Percentual de Encurtamento', data['calculos']['percentEncurt']),
            ('Espessura Relativa', data['calculos']['espRelativa']),
            ('Massa do VE', data['calculos']['massaVE'])
        ]
        
        for i, (label, value) in enumerate(calculos):
            cells = calculos_table.rows[i].cells
            cells[0].text = label
            cells[1].text = str(value)
            
        doc.add_paragraph('\n')  # Espaço antes do laudo
        
        # Converter HTML para texto formatado
        soup = BeautifulSoup(data['laudo'], 'html.parser')
        for p in soup.find_all(['p', 'div']):
            paragraph = doc.add_paragraph()
            paragraph.paragraph_format.line_spacing_rule = WD_LINE_SPACING.ONE_POINT_FIVE
            paragraph.paragraph_format.space_after = Pt(12)
            paragraph.paragraph_format.keep_together = True
            
            # Processar o texto e formatação por partes
            for element in p.children:
                if element.name in ['strong', 'b']:
                    run = paragraph.add_run(element.get_text())
                    run.bold = True
                elif element.name in ['em', 'i']:
                    run = paragraph.add_run(element.get_text())
                    run.italic = True
                else:
                    run = paragraph.add_run(str(element))
                run.font.name = 'Arial'
                run.font.size = Pt(12)
            
            # Aplicar formatação
            if p.find('strong') or p.find('b'):
                run.bold = True
            if p.find('em') or p.find('i'):
                run.italic = True
            if p.find('u'):
                run.underline = True
            
            # Alinhamento
            if 'text-align' in p.get('style', ''):
                if 'center' in p['style']:
                    paragraph.alignment = WD_ALIGN_PARAGRAPH.CENTER
                elif 'right' in p['style']:
                    paragraph.alignment = WD_ALIGN_PARAGRAPH.RIGHT
                elif 'justify' in p['style']:
                    paragraph.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
        
        # Salvar em memória
        doc_stream = io.BytesIO()
        doc.save(doc_stream)
        doc_stream.seek(0)
        
        return send_file(
            doc_stream,
            mimetype='application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            as_attachment=True,
            download_name=f"Laudo_{data['paciente']['nome']}.docx"
        )
    except Exception as e:
        print(f"Erro ao gerar DOC: {e}")
        return jsonify({"error": "Falha ao gerar documento"}), 500




if __name__ == '__main__':
    try:
        with app.app_context():
            db.create_all()
            print("Tabelas criadas com sucesso!")
    except Exception as e:
        print(f"Erro ao criar tabelas: {e}")
    
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=True)