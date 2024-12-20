from flask_sqlalchemy import SQLAlchemy
from flask_login import UserMixin
from datetime import datetime

db = SQLAlchemy()

class Doctor(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    full_name = db.Column(db.String(100), nullable=False)
    crm = db.Column(db.String(20), nullable=False, unique=True)
    rqe = db.Column(db.String(20))

    reports = db.relationship('Report', backref='doctor', lazy=True)

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
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    content = db.Column(db.Text, nullable=False)
    category = db.Column(db.String(50), nullable=False)  # 'laudo', 'normal', 'alterado', 'conclusao'
    doctor_id = db.Column(db.Integer, db.ForeignKey('doctor.id'))
    order = db.Column(db.Integer, default=0)  # Para ordenação das frases
    doctor = db.relationship('Doctor', backref='templates')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    last_modified = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

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

class Report(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    patient_name = db.Column(db.String(100), nullable=False)
    patient_birthdate = db.Column(db.Date)
    patient_gender = db.Column(db.String(20))
    patient_weight = db.Column(db.Float)
    patient_height = db.Column(db.Float)
    body_surface = db.Column(db.Float)
    exam_date = db.Column(db.Date, nullable=False)

    # Medidas ecocardiográficas
    left_atrium = db.Column(db.Float)  # Átrio Esquerdo
    aorta = db.Column(db.Float)
    ascending_aorta = db.Column(db.Float)  # Aorta Ascendente
    diastolic_diameter = db.Column(db.Float)  # Diâmetro Diastólico
    systolic_diameter = db.Column(db.Float)  # Diâmetro Sistólico
    septum_thickness = db.Column(db.Float)  # Espessura do Septo
    posterior_wall = db.Column(db.Float)  # Espessura da Parede (PPVE)
    right_ventricle = db.Column(db.Float)  # Ventrículo Direito

    # Conteúdo do laudo
    content = db.Column(db.Text, nullable=False)

    # Relacionamentos
    doctor_id = db.Column(db.Integer, db.ForeignKey('doctor.id'), nullable=False)

    # Campos de auditoria
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    last_modified = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def __repr__(self):
        return f'<Report {self.patient_name}>'

    def to_dict(self):
        return {
            'id': self.id,
            'patient_name': self.patient_name,
            'patient_birthdate': self.patient_birthdate.strftime('%Y-%m-%d') if self.patient_birthdate else None,
            'patient_gender': self.patient_gender,
            'patient_weight': self.patient_weight,
            'patient_height': self.patient_height,
            'body_surface': self.body_surface,
            'exam_date': self.exam_date.strftime('%Y-%m-%d') if self.exam_date else None,
            'left_atrium': self.left_atrium,
            'aorta': self.aorta,
            'ascending_aorta': self.ascending_aorta,
            'diastolic_diameter': self.diastolic_diameter,
            'systolic_diameter': self.systolic_diameter,
            'septum_thickness': self.septum_thickness,
            'posterior_wall': self.posterior_wall,
            'right_ventricle': self.right_ventricle,
            'content': self.content,
            'doctor': self.doctor.to_dict() if self.doctor else None,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'last_modified': self.last_modified.isoformat() if self.last_modified else None
        }