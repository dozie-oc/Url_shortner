from flask import Blueprint, request, render_template
from .forms import LinkForm
from .models import original_url, short_url
from . import db
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

pages =  Blueprint('pages', __name__)

@pages.route('/', methods=['GET', 'POST'])
def index():
    short_url = None
    form = LinkForm()
    if form.validate_on_submit():
        original_url = form.url.data
        new_url = original_url(original_url=original_url)
        db.session.add(new_url)
        db.session.commit()
        logger.info(f"New URL saved with ID: {new_url.id}")
    
    return render_template('index.html', short_url=short_url)

@pages.route('/traffic')
def traffic():
    return "<h1>Traffic Page</h1>"