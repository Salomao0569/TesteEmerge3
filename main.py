
from flask import Flask, render_template, request, jsonify
from models import db, Doctor, Template
import os
from dotenv import load_dotenv

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

if __name__ == '__main__':
    with app.app_context():
        try:
            db.create_all()
            print("Tabelas criadas com sucesso!")
        except Exception as e:
            print(f"Erro ao criar tabelas: {e}")
    
    app.run(host='0.0.0.0', port=3000, debug=True)
