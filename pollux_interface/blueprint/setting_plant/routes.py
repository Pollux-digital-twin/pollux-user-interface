from flask import Blueprint, request, jsonify
from flask import current_app
import os
import json

setting_plant = Blueprint('setting_plant', __name__)


# ================================================================
# API FUNCTION
# ================================================================

@setting_plant.route('/setting/plant/get_plant_parameters', methods=['POST'])
def get_plant_parameters():
    project_name = request.json['field_name']
    project_folder_path = os.path.join(current_app.config['POLLUX_PROJECT_FOLDER'], project_name)

    with open(os.path.join(project_folder_path, 'plant.conf'), "r") as jsonfile:
        plant_conf = json.load(jsonfile)

    return jsonify(plant_conf)


@setting_plant.route('/setting/plant/save_plant_parameters', methods=['POST'])
def save_plant_parameters():
    project_name = request.json['field_name']
    project_folder_path = os.path.join(current_app.config['POLLUX_PROJECT_FOLDER'], project_name)

    plant_conf = request.json['parameters']

    with open(os.path.join(project_folder_path, 'plant.conf'), "w") as jsonfile:
        jsonfile.write(json.dumps(plant_conf, indent=4, sort_keys=True))

    return 'new parameters are saved'
