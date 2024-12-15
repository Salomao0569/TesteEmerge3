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
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    content = db.Column(db.Text, nullable=False)
    category = db.Column(db.String(50), nullable=False)  # 'laudo', 'normal', 'alterado', 'conclusao'
    doctor_id = db.Column(db.Integer, db.ForeignKey('doctor.id'))
    doctor = db.relationship('Doctor', backref='templates')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    last_modified = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def __repr__(self):
        return f'<Template {self.name}>'

    def to_dict(self):
        """Convert template to dictionary preserving HTML formatting"""
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
            'content': self.content,  # Content is stored as raw HTML
            'category': self.category,
            'doctor': doctor_data
        }

    def set_content(self, html_content):
        """Set content ensuring HTML is preserved"""
        self.content = html_content
