from . import db

class url(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    url = db.Column(db.String(2048), nullable=False)

    def __repr__(self):
        return f'<URL {self.url}>'

class short_code(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    code = db.Column(db.String(10), unique=True, nullable=False)
    url_id = db.Column(db.Integer, db.ForeignKey('url.id'), nullable=False)
    url = db.relationship('url', backref=db.backref('short_codes', lazy=True))

    def __repr__(self):
        return f'<ShortCode {self.code}>'

class click(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    timestamp = db.Column(db.DateTime, nullable=False)
    short_code_id = db.Column(db.Integer, db.ForeignKey('short_code.id'), nullable=False)
    short_code = db.relationship('short_code', backref=db.backref('clicks', lazy=True))