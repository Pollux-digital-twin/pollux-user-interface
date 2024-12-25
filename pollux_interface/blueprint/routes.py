from flask import Blueprint, render_template, send_from_directory, redirect, url_for
from flask_login import login_required

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
