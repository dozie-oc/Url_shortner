from flask import Blueprint, request, render_template
from .forms import LinkForm

pages =  Blueprint('pages', __name__)

@pages.route('/', methods=['GET', 'POST'])
def index():
    form = LinkForm()
    url = None
    if form.validate_on_submit():
        url = form.url.data
        # Here you would typically shorten the URL and save it to the database
        
    return render_template('index.html', form=form, short_url=url)

@pages.route('/traffic')
def traffic():
    return "<h1>Traffic Page</h1>"