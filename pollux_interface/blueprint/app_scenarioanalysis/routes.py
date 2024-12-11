from flask import Blueprint, request, jsonify, current_app
import os
import shutil
import json

from pollux_application.power2hydrogen.p2h2_solver import Power2Hydrogen


# Create Blueprint
app_scenarioanalysis = Blueprint("scenarioanalysis", __name__)


current_dir = os.getcwd()
pollux_main = os.path.dirname(current_dir)
PROJECT_FOLDER = os.path.join(pollux_main, 'pollux-project')

# =================================================================================
# Initialization
# =================================================================================
@app_scenarioanalysis.route('/app/scenarioanalysis/get_scenario_data', methods=['POST'])
def get_scenario_data():
    project_name = request.json["project_name"]
    scenario_name = request.json['scenario_name']

    PROJECT_DIR = os.path.join(PROJECT_FOLDER, project_name)
    file_path = os.path.join(PROJECT_DIR, scenario_name + '.json')

    if os.path.exists(file_path):
        try:
            with open(file_path, 'r') as file:
                scenario_data = json.load(file)
        except Exception as e:
            print(f"An error occurred while opening the file: {e}")

    return jsonify(scenario_data['scenario'])

# =================================================================================
# Run
# =================================================================================
@app_scenarioanalysis.route("/app/scenarioanalysis/run_solver", methods=["POST"])
def run_solver():
    input_param = request.json["input_data"]
    control_parameters = input_param["control_parameters"]
    parameters = {
        "component_parameters": input_param['table_data'],
        "project_name": input_param['project_name'],
        "project_case": input_param['project_case'],
        "time_horizon": input_param['time_horizon'],
        "time_step": input_param['time_step'],
        "control_parameters": control_parameters,
        "mode": input_param['mode'],
        "optimization_method": input_param['optimization_method']
    }

    app_solver = Power2Hydrogen()

    app_solver.init_parameters(parameters)

    # Define inputs
    input = {
        "time_horizon": float(input_param['time_horizon']),
        "time_step": float(input_param['time_step']),
        "project_case": input_param['project_case'],
        "mode": input_param['mode'],
        "optimization_method": input_param['optimization_method'],
        "control_parameters": control_parameters
    }

    app_solver.calculate(input)

    output = app_solver.get_output()

    return output

# =================================================================================
# Scenario management
# =================================================================================
@app_scenarioanalysis.route('/app/scenarioanalysis/getexistingscenariolist', methods=['POST'])
def get_existing_scenario_list():
    filename = []
    project_name = request.json['project_name']
    PROJECT_DIR = os.path.join(PROJECT_FOLDER, project_name)
    for x in os.listdir(PROJECT_DIR):
        # Get the full path of the item
        full_path = os.path.join(PROJECT_DIR, x)

        # Check if it is a file, ends with '.conf', and is not 'diagram.json'
        if os.path.isfile(full_path) and x.endswith('.json') and x != 'diagram.json':
            filename.append(x[:-5])
    return jsonify(filename)


@app_scenarioanalysis.route('/app/scenarioanalysis/loadscenario', methods=['POST'])
def loadscenario():
    project_name = request.json['project_name']
    scenario_name = request.json['scenario_name']
    if scenario_name == '':
        scenario_name = 'scenario_default'

    projectpath = os.path.join(PROJECT_FOLDER, project_name)
    file_path = os.path.join(projectpath, f"{scenario_name}.json")

    if os.path.exists(file_path):
        with open(file_path, 'r') as json_file:
            json_data = json.load(json_file)
    else:
        print(f"File {file_path} does not exist.")

    response = {
        "project_name": project_name,
        "scenario_name": scenario_name,
        "projectpath": projectpath,
        "scenario_data": json_data
    }
    return jsonify(response)


@app_scenarioanalysis.route('/app/scenarioanalysis/save_scenario', methods=['POST'])
def save_scenario():
    try:
        # Parse input data
        scenario_data = request.json.get('scenario_data')
        data = request.json.get('input_data')
        if not data:
            return jsonify({'error': 'No input_data provided'}), 400

        project_name = data.get('project_name')
        scenario_name = data.get('scenario_name')

        if not project_name or not scenario_name:
            return jsonify({'error': 'Missing project_name or scenario_name'}), 400

        # Define paths
        base_folder = current_app.config['POLLUX_PROJECT_FOLDER']
        project_folder_path = os.path.join(base_folder, project_name)
        template_folder_path = os.path.join(base_folder, '_template')

        # Ensure directories exist and copy files
        os.makedirs(project_folder_path, exist_ok=True)
        shutil.copy(os.path.join(template_folder_path, 'template_plant.conf'),
                    os.path.join(project_folder_path, 'plant.conf'))

        return jsonify({'message': 'Scenario saved successfully!'})

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app_scenarioanalysis.route('/app/scenarioanalysis/newscenario', methods=['POST'])
def newscenario():

    project_name = request.json['project_name']
    new_scenario_name = request.json['new_scenario_name']
    copy_scenario_name = request.json['copy_scenario_name']

    projectpath = os.path.join(PROJECT_FOLDER, project_name)

    copy_conf = os.path.join(projectpath, copy_scenario_name + '.json')
    new_conf = os.path.join(projectpath, new_scenario_name + '.json')

    shutil.copyfile(copy_conf, new_conf)

    return ''


@app_scenarioanalysis.route('/app/scenarioanalysis/deletescenario', methods=['POST'])
def deletescenario():

    project_name = request.json['project_name']
    scenario_name = request.json['scenario_name']

    PROJECT_DIR = os.path.join(PROJECT_FOLDER, project_name)

    os.remove(os.path.join(PROJECT_DIR, scenario_name + '.json'))

    return ''