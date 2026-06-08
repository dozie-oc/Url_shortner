from flask import request, redirect, render_template, url_for
from app.forms import LinkForm
from. import app

@app.route('/', methods=['GET', 'POST'])
def home():
    form = LinkForm()
    if form.validate_on_submit():
        url = form.url.data

        # Here you would add logic to shorten the URL and save it to a database
        return redirect(url)  # For now, just redirect to the original URL
    return render_template('base.html', form=form)