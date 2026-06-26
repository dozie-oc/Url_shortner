from flask import Blueprint, request, render_template, redirect, url_for, flash
from .forms import LinkForm
from .models import click, url, short_code
from hashids import Hashids
from . import db
import logging
from datetime import datetime

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

hashid = Hashids(min_length=6)

pages =  Blueprint('pages', __name__)

def log_click(entry):
    short_code_entry = short_code.query.filter_by(code=entry).first()
    if short_code_entry:
        click_entry = click(short_code_id=short_code_entry.id, timestamp=datetime.utcnow())
        db.session.add(click_entry)

def delete_url(url_id):
    url_entry = url.query.get(url_id)
    if url_entry:
        # Delete associated short codes and clicks
        for sc in url_entry.short_codes:
            click.query.filter_by(short_code_id=sc.id).delete()
            db.session.delete(sc)
        db.session.delete(url_entry)
        db.session.commit()
        logger.info(f"Deleted URL with ID: {url_id}")
    else:
        logger.warning(f"URL with ID: {url_id} not found for deletion.")

@pages.route('/', methods=['GET', 'POST'])
def index():
    short_url = None
    form = LinkForm()
    if form.validate_on_submit():
        origin_url = form.url.data
        existing_url = url.query.filter_by(url=origin_url).first()
        if existing_url:
            logger.info(f"URL already exists with ID: {existing_url.id}")
            hashed_id = hashid.encode(existing_url.id)
            short_url = url_for("pages.redirect_to_url", short_code=hashed_id, _external=True)
        else:
            new_url = url(url=origin_url)
            db.session.add(new_url)
            db.session.commit()
            logger.info(f"New URL saved with ID: {new_url.id}")
            hashed_id = hashid.encode(new_url.id)
            to_model = short_code(code=hashed_id, url_id=new_url.id)
            db.session.add(to_model)
            db.session.commit()

        short_url = url_for("pages.redirect_to_url", short_code=hashed_id, _external=True)
        flash("URL shortened successfully!", "success")
    
    return render_template('index.html', form=form, short_url=short_url or None)

@pages.route('/<short_code>')
def redirect_to_url(short_code):
    url_id = hashid.decode(short_code)
    if url_id:
        original_url = url.query.get(url_id[0])
        if original_url:
            log_click(short_code)
            db.session.commit()
            return redirect(original_url.url)
    return "<h1>URL not found</h1>"

@pages.route('/traffic', methods=['GET', 'POST'])
def traffic():
    if request.method == 'POST':
        url_id = request.form.get('url_id')
        delete_url(url_id)
    urls = url.query.all()
    return render_template('analytics.html', urls=urls)