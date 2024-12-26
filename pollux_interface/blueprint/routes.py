from flask import Blueprint, render_template, send_from_directory, redirect, url_for, current_app
from flask_login import login_required
import os

main = Blueprint('main', __name__)


@main.route('/')
@login_required
def index():
    return redirect(url_for('main.app_scenarioanalysis'))


# @main.route('/app/diagram')
# @login_required
# def app_diagram():
#     return render_template('app_diagram.html')


@main.route('/app/scenarioanalysis')
@login_required
def app_scenarioanalysis():
    return render_template('app_scenarioanalysis.html')


@main.route('/app/visualisation')
@login_required
def app_visualisation():
    return render_template('app_visualisation.html')


@main.route('/templates/<path:filename>')
def serve_template_file(filename):
    return send_from_directory('templates', filename)


@main.route('/documentation')
def documentation():
    return render_template('documentation.html')


@main.route('/documentation/sphinx/', defaults={'filename': 'index.html'})
@main.route('/documentation/sphinx/<path:filename>')
def docshtml(filename):
    return send_from_directory(
        os.path.join(current_app.config['POLLUX_DOCUMENTATION_FOLDER'], 'build', 'html'),
        filename
    )
