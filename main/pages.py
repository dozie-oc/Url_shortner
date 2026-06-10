from flask import Blueprint

pages =  Blueprint('pages', __name__)

@pages.route('/')
def index():
    return "<h1>Welcome to the Home Page</h1>"

@pages.route('/traffic')
def traffic():
    return "<h1>Traffic Page</h1>"