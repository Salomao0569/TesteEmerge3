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
    with app.app_context():
        try:
            db.create_all()
            print("Tabelas criadas com sucesso!")
        except Exception as e:
            print(f"Erro ao criar tabelas: {e}")
    
    port = int(os.environ.get('PORT', 80))
    app.run(host='0.0.0.0', port=port, debug=False)