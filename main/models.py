from . import db

class original_url(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    original_url = db.Column(db.String(2048), nullable=False)

    def __repr__(self):
        return f'<URL {self.original_url}>'

class short_url(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    short_url = db.Column(db.String(10), unique=True, nullable=False)
    original_url_id = db.Column(db.Integer, db.ForeignKey('original_url.id'), nullable=False)
    original_url = db.relationship('original_url', backref=db.backref('short_urls', lazy=True))

    def __repr__(self):
        return f'<ShortURL {self.short_url}>'