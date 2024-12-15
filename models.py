
from flask_sqlalchemy import SQLAlchemy
from flask_login import UserMixin

db = SQLAlchemy()

class Doctor(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    full_name = db.Column(db.String(100), nullable=False)
    crm = db.Column(db.String(20), nullable=False, unique=True)
    rqe = db.Column(db.String(20))
    
    def __repr__(self):
        return f'<Doctor {self.full_name}>'

    def to_dict(self):
        return {
            'id': self.id,
            'full_name': self.full_name,
            'crm': self.crm,
            'rqe': self.rqe
        }

class Template(db.Model):
    CATEGORIES = {
        'laudo': 'Modelo de Laudo Completo',
        'normal': 'Frase Normal',
        'alterado': 'Frase Alterada',
        'conclusao': 'Frase de Conclusão'
    }
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    content = db.Column(db.Text, nullable=False)
    category = db.Column(db.String(50), nullable=False)
    doctor_id = db.Column(db.Integer, db.ForeignKey('doctor.id'))
    doctor = db.relationship('Doctor', backref='templates')
    created_at = db.Column(db.DateTime, default=db.func.now())
    
    def __repr__(self):
        return f'<Template {self.name}>'

    def to_dict(self):
        doctor_data = None
        if self.doctor:
            doctor_data = {
                'id': self.doctor.id,
                'full_name': self.doctor.full_name,
                'crm': self.doctor.crm,
                'rqe': self.doctor.rqe
            }
        return {
            'id': self.id,
            'name': self.name,
            'content': self.content,
            'category': self.category,
            'doctor': doctor_data
        }

    def set_content(self, html_content):
        self.content = html_content

class Laudo(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    data_exame = db.Column(db.DateTime, nullable=False)
    paciente_nome = db.Column(db.String(100), nullable=False)
    paciente_data_nascimento = db.Column(db.Date)
    paciente_sexo = db.Column(db.String(10))
    peso = db.Column(db.Float)
    altura = db.Column(db.Float)
    medidas = db.Column(db.JSON)
    calculos = db.Column(db.JSON)
    conteudo = db.Column(db.Text, nullable=False)
    doctor_id = db.Column(db.Integer, db.ForeignKey('doctor.id'))
    doctor = db.relationship('Doctor', backref='laudos')
    created_at = db.Column(db.DateTime, default=db.func.now())
    
    def to_dict(self):
        return {
            'id': self.id,
            'data_exame': self.data_exame.isoformat(),
            'paciente_nome': self.paciente_nome,
            'paciente_data_nascimento': self.paciente_data_nascimento.isoformat() if self.paciente_data_nascimento else None,
            'paciente_sexo': self.paciente_sexo,
            'peso': self.peso,
            'altura': self.altura,
            'medidas': self.medidas,
            'calculos': self.calculos,
            'conteudo': self.conteudo,
            'doctor': self.doctor.to_dict() if self.doctor else None,
            'created_at': self.created_at.isoformat()
        }
