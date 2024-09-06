from flask import Blueprint, render_template, current_app, send_from_directory
from flask_login import login_required
import os

main = Blueprint('main', __name__)


@main.route('/')
@login_required
def index():
    return render_template('index.html')


@main.route('/app/diagram')
@login_required
def app_diagram():
    return render_template('app_diagram.html')


@main.route('/app/tagbrowser')
@login_required
def app_tagbrowser():
    return render_template('app_tagbrowser.html')


# ===================================================================
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


@main.route('/report')
@login_required
def report():
    return render_template('report.html')


@main.route('/app/timeseriesviewer')
@login_required
def timeseriesviewer():
    return render_template('timeseries.html')


# ====================================================================
@main.route('/setting/plant')
@login_required
def setting_plant():
    return render_template('setting_plant.html')
