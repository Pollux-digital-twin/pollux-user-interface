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


@setting_plant.route('/setting/plant/get_database_parameters', methods=['POST'])
def get_database_parameters():
    project_name = request.json['field_name']
    database_name = request.json['database_name']
    project_folder_path = os.path.join(current_app.config['POLLUX_PROJECT_FOLDER'], project_name)

    with open(os.path.join(project_folder_path, 'plant.conf'), "r") as jsonfile:
        plant_conf = json.load(jsonfile)

    db_conf = plant_conf['database'][database_name]

    return jsonify(db_conf)


@setting_plant.route('/setting/plant/save_plant_parameters', methods=['POST'])
def save_plant_parameters():
    project_name = request.json['field_name']
    project_folder_path = os.path.join(current_app.config['POLLUX_PROJECT_FOLDER'], project_name)

    parameters = request.json['parameters']

    with open(os.path.join(project_folder_path, 'plant.conf'), "r") as jsonfile:
        plant_conf = json.load(jsonfile)

    plant_conf['database']['start_time'] = parameters['start_time']
    plant_conf['database']['measured']['interval'] = parameters['measured_interval']
    plant_conf['database']['filtered']['interval'] = parameters['filtered_interval']
    plant_conf['database']['calculated']['interval'] = parameters['calculated_interval']
    plant_conf['database']['prediction']['interval'] = parameters['prediction_interval']
    plant_conf['database']['prediction']['horizon'] = parameters['prediction_horizon']

    with open(os.path.join(project_folder_path, 'plant.conf'), "w") as jsonfile:
        jsonfile.write(json.dumps(plant_conf))

    return 'new parameters are saved'


@setting_plant.route('/setting/plant/save_database_parameters', methods=['POST'])
def save_database_parameters():
    project_name = request.json['field_name']
    project_folder_path = os.path.join(current_app.config['POLLUX_PROJECT_FOLDER'], project_name)
    database_name = request.json['database_name']
    db_conf = request.json['parameters']

    with open(os.path.join(project_folder_path, 'plant.conf'), "r") as jsonfile:
        plant_conf = json.load(jsonfile)

    plant_conf['database'][database_name] = db_conf

    with open(os.path.join(project_folder_path, 'plant.conf'), "w") as jsonfile:
        jsonfile.write(json.dumps(plant_conf))

    return 'new database parameters are saved'
