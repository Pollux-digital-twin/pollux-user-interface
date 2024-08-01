from flask import Blueprint, render_template, current_app, send_from_directory
from flask_login import login_required, current_user
import os

main = Blueprint('main', __name__)


@main.route('/')
@login_required
def index():
    return render_template('index.html')

@main.route('/app/example_app_route')
@login_required
def app_example():
    return render_template('app_example.html')