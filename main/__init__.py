from flask import Flask
from flask_sqlalchemy import SQLAlchemy

app = Flask(__name__)

def create_app():
    app.config['SECRET_KEY'] = 'your_secret_key_here'
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///urls.db'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    
    from .pages import pages
    app.register_blueprint(pages, url_prefix='/')
    
    return app