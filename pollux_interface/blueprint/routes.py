from flask import Blueprint, render_template, current_app, send_from_directory
from flask_login import login_required, current_user
import os

main = Blueprint('main', __name__)


@main.route('/')
@login_required
def index():
    return render_template('index.html')

@main.route('/documentation')
def documentation():
    return render_template('index.html')

@main.route('/documentation/sphinx/', defaults={'filename': 'index.html'})
@main.route('/documentation/sphinx/<path:filename>')
def docshtml(filename):
    return send_from_directory(
        os.path.join(current_app.config['POLLUX_DOCUMENTATION_FOLDER'], 'build', 'html'),
        filename
    )

# @main.route('/app/example_app_route')
# @login_required
# def app_example():
#     return render_template('app_example.html')

@main.route('/app/timeseriesviewer')
@login_required
def timeseriesviewer():
    return render_template('timeseries.html')

@main.route('/app/app_electrolyser')
@login_required
def app_electrolyser():
    return render_template('app_electrolyser.html')

@main.route('/app/app_heatpump')
@login_required
def app_heatpump():
    return render_template('app_heatpump.html')

@main.route('/setting/plant')
@login_required
def setting_plant():
    return render_template('setting_plant.html')