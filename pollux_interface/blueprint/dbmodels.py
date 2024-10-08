from pollux_interface.create_app import db
from flask_login import UserMixin


class User(UserMixin, db.Model):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(100), unique=True)
    password = db.Column(db.String(1000))
    name = db.Column(db.String(100), unique=True)
    role = db.Column(db.String(100))
    group = db.Column(db.String(100))


class Project(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100))
    user = db.Column(db.String(100))
    group = db.Column(db.String(100))
