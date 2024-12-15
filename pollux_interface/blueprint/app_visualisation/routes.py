from flask import Blueprint, request, jsonify, current_app
import os
import shutil
import json

# Import required application objects


# Create Blueprint
app_visualisation = Blueprint("visualisation", __name__)


current_dir = os.getcwd()
pollux_main = os.path.dirname(current_dir)
PROJECT_FOLDER = os.path.join(pollux_main, 'pollux-project')

@app_visualisation.route('/app/visualisation/getresultslist', methods=['POST'])
def getresultslist():
    project_name = request.json["project_name"]
    results_folder = os.path.join(PROJECT_FOLDER, project_name, 'results')

    results_list = []

    # List all files in the results directory
    for filename in os.listdir(results_folder):
        if filename.endswith("_output.json"):
            # Extract the project_name from the filename (before _output.json)
            scenario_name = filename.replace(f'{project_name}_', '').replace('_output.json', '')
            if scenario_name not in results_list:
                results_list.append(scenario_name)
    output = {'results_list': results_list}
    return output

@app_visualisation.route('/app/visualisation/loadresults', methods=['POST'])
def loadresults():
    input = request.json["input"]
    project_name = input['project_name']
    result_name = input['result_name']

    output_dir = os.path.join(PROJECT_FOLDER, project_name, "results")
    os.makedirs(output_dir, exist_ok=True)

    # Create output filenames
    result_data_filename = os.path.join(
        output_dir, f"{project_name}_{result_name}_output.json"
    )

    # Check if the output file exists
    if os.path.exists(result_data_filename):
        # Load outputs_dict
        with open(result_data_filename, "r") as output_file:
            result_data = json.load(output_file)
    else:
        print(f"Error: The file {result_data_filename} does not exist.")

    return result_data


@app_visualisation.route('/app/visualisation/plotresults', methods=['POST'])
def plotresults():
    print('plotresults')
