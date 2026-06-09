from flask import Flask
from flask_sqlalchemy import SQLAlchemy

from main import routes

app = Flask(__name__)
db = SQLAlchemy()

def create_app():
    app.config['SECRET_KEY'] = 'your_secret_key_here'
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///urls.db'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    
    app.register_blueprint(routes)
    db.init_app(app)

    from main import forms
    from .models import URL
    
    with app.app_context():
        db.create_all()
    
    return app