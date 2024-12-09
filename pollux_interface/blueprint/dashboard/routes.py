from flask import Blueprint, request
from flask import current_app
import os
import json

dashboard = Blueprint('dashboard', __name__)


# ================================================================
# API FUNCTION
# ================================================================

@dashboard.route('/dashboard/get_url', methods=['POST'])
def get_plant_parameters():
    project_name = request.json['field_name']
    project_folder_path = os.path.join(current_app.config['POLLUX_PROJECT_FOLDER'], project_name)

    with open(os.path.join(project_folder_path, 'plant.conf'), "r") as jsonfile:
        plant_conf = json.load(jsonfile)

    url = plant_conf['dashboard']['url']

    return url
