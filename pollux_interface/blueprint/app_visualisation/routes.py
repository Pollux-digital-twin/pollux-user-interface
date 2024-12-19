from flask import Blueprint, request, jsonify, current_app
import os
import json
import numpy as np

# Create Blueprint
app_visualisation = Blueprint("visualisation", __name__)


@app_visualisation.route("/app/visualisation/getresultslist", methods=["POST"])
def getresultslist():
    project_name = request.json["project_name"]
    results_folder = os.path.join(current_app.config['POLLUX_PROJECT_FOLDER'], project_name, "results")

    results_list = []

    # List all files in the results directory
    for filename in os.listdir(results_folder):
        if filename.endswith("_output.json"):
            # Extract the project_name from the filename (before _output.json)
            scenario_name = filename.replace(f"{project_name}_", "").replace(
                "_output.json", ""
            )
            if scenario_name not in results_list:
                results_list.append(scenario_name)
    output = {"results_list": results_list}
    return output


@app_visualisation.route("/app/visualisation/loadresults", methods=["POST"])
def loadresults():
    input = request.json["input"]
    project_name = input["project_name"]
    result_name = input["result_name"]

    output_dir = os.path.join(current_app.config['POLLUX_PROJECT_FOLDER'], project_name, "results")
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

    time_horizon = result_data["solver_param"]["time_horizon"]
    step_size_control = result_data["solver_param"]["step_size_control"]
    time_vector_control = np.linspace(
        0, time_horizon, time_horizon // step_size_control + 1
    )

    plot_data = {
        "objective_func_plot": {
            "function_value": result_data["solver_param"]["function_value"],
            "label": "rmse [MW]",
        },
        "scaled_control_plot": {
            "time_vector_control": result_data["solver_param"]["time_vector_control"],
            "control_scaled_value": result_data["solver_param"]["control_scaled_value"],
            "components_with_control": result_data["solver_param"][
                "components_with_control"
            ],
        },
        "control_profiles_plot": {
            "control_reshaped": result_data["solver_param"]["control_reshaped"],
            "time_vector_control": result_data["solver_param"]["time_vector_control"],
            "components_with_control": result_data["solver_param"][
                "components_with_control"
            ],
            "time_vector_control": result_data["solver_param"]["time_vector_control"],
        },
        "power_profiles_plot": {
            "time_vector": result_data["solver_param"]["time_vector"],
            "power_supply": result_data["outputs"]["power_supply"],
            "power_delivered": result_data["outputs"]["power_delivered"],
            "electrolyser_power_input": result_data["outputs"][
                "electrolyser_power_input"
            ],
            "power_demand": result_data["outputs"]["power_demand"],
        },
        "hydrogen_profiles_plot": {
            "time_vector": result_data["solver_param"]["time_vector"],
            "hydrogen_electrolyser_to_demand": result_data["outputs"][
                "hydrogen_electrolyser_to_demand"
            ],
            "hydrogen_electrolyser_to_storage": result_data["outputs"][
                "hydrogen_electrolyser_to_storage"
            ],
            "hydrogen_storage_mass_flow_out": result_data["outputs"][
                "hydrogen_storage_mass_flow_out"
            ],
            "hydrogen_demand": result_data["outputs"]["hydrogen_demand"],
            "hydrogen_delivered": result_data["outputs"]["hydrogen_delivered"],
        },
        "mismatch_plot": {
            "time_vector": result_data["solver_param"]["time_vector"],
            "power_difference": result_data["outputs"]["power_difference"],
            "hydrogen_difference": result_data["outputs"]["hydrogen_difference"],
        },
        "kpi_plot": {
            "time_vector": result_data["solver_param"]["time_vector"],
            "efficiency_electrolyser": result_data["outputs"][
                "efficiency_electrolyser"
            ],
        },
        "hydrogen_storage_plot": {
            "time_vector": result_data["solver_param"]["time_vector"],
            "hydrogen_mass_stored": result_data["outputs"]["hydrogen_mass_stored"],
            "fill_level": result_data["outputs"]["fill_level"],
            "hydrogen_storage_mass_flow_in": result_data["outputs"][
                "hydrogen_storage_mass_flow_in"
            ],
            "hydrogen_storage_mass_flow_out": result_data["outputs"][
                "hydrogen_storage_mass_flow_out"
            ],
        },
    }

    return plot_data
