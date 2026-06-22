from flask import Flask
from flask_sqlalchemy import SQLAlchemy

app = Flask(__name__)
db = SQLAlchemy() 

def create_app():
    app.config['SECRET_KEY'] = 'your_secret_key_here'
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///urls.db'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    db.init_app(app)

    from .models import url, short_code
    from .pages import pages

    app.register_blueprint(pages, url_prefix='/')
    
    with app.app_context():
        db.create_all()
    
    return app