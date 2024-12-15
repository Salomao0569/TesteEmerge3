from flask import Flask, render_template, request, jsonify
from models import db, Doctor, Template
import os
from dotenv import load_dotenv
from htmldocx import HtmlToDocx # Added import for HTML to DOCX conversion

app = Flask(__name__)

# Configuração do banco de dados
app.config['SQLALCHEMY_DATABASE_URI'] = "postgresql://biocardio:biocardio86@biocardio.ch2suoae2l0p.sa-east-1.rds.amazonaws.com:5432/biocardio"
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SECRET_KEY'] = 'your-secret-key'

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
        parser = HtmlToDocx()
        doc = parser.parse_html_string(data['laudo'])
        
        # Configurar estilos do documento
        for paragraph in doc.paragraphs:
            paragraph.paragraph_format.line_spacing = 1.5
            paragraph.paragraph_format.space_after = Pt(12)
            
        # Salvar temporariamente
        temp_path = "temp_report.docx"
        doc.save(temp_path)
        
        with open(temp_path, 'rb') as f:
            doc_data = f.read()
        os.remove(temp_path)
        
        return send_file(
            io.BytesIO(doc_data),
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
    
    app.run(host='0.0.0.0', port=3000, debug=True)