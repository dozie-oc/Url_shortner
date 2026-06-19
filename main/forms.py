from flask_wtf import FlaskForm
from wtforms import StringField, SubmitField
from wtforms.validators import URL, DataRequired

class LinkForm(FlaskForm):
    url = StringField('URL', 
                      validators=[DataRequired(), 
                                  URL(require_tld=False, 
                                      message='Invalid URL')])
    submit = SubmitField('Shorten')