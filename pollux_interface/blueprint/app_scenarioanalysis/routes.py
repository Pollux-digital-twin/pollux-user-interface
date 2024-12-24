from flask import Blueprint, request, jsonify, current_app
import os
import shutil
import json
import numpy as np
import traceback

from pollux_application.power2hydrogen.p2h2_solver import Power2Hydrogen

# Create Blueprint
app_scenarioanalysis = Blueprint("scenarioanalysis", __name__)


# =================================================================================
# Run
# =================================================================================
@app_scenarioanalysis.route("/app/scenarioanalysis/run_solver", methods=["POST"])
def run_solver():
    try:
        project_name = request.json["project_name"]
        scenario_name = request.json["scenario_name"]
        sim_data = request.json["sim_data"]

        PROJECT_DIR = os.path.join(current_app.config['POLLUX_PROJECT_FOLDER'], project_name)
        with open(os.path.join(PROJECT_DIR, scenario_name + '.json'), "r") as json_file:
            scenario_data = json.load(json_file)
            scenario_data = scenario_data["scenario"]

        transformed_profiles = transform_profiles(scenario_data, sim_data)

        parameters = {
            "component_parameters": scenario_data["component_parameters"],
            "project_name": scenario_data["project_name"],
            "project_case": scenario_data["project_case"],
            "time_horizon": sim_data["time_horizon"],
            "control_step": sim_data["control_step"],
            "profiles_parameters": transformed_profiles,
            "optimisation_parameters": scenario_data['optimisation_parameters'],
            "mode": sim_data["mode"],
        }

        app_solver = Power2Hydrogen()

        app_solver.init_parameters(parameters)

        # Define inputs
        input_solver = {
            "mode": sim_data["mode"],
            "optimisation_parameters": scenario_data['optimisation_parameters'],
            "maxiter": 200,
            "finite_diff_step": 0.001,
            "optimisation_method": 'trust-constr'
        }

        app_solver.calculate(input_solver)

        app_solver.get_output()

        solver_param = {
            "control_reshaped": app_solver.control_reshaped,
            "function_value": app_solver.function_value,
            "step_size_control": app_solver.step_size_control,
            "time_vector_control": app_solver.time_vector_control,
            "time_vector": app_solver.time_vector,
            "control_scaled_value": app_solver.control_scaled_value,
            "time_horizon": app_solver.time_horizon,
            "components_with_control": app_solver.components_with_control,
        }

        app_solver.save_results(
            current_app.config['POLLUX_PROJECT_FOLDER'], project_name, scenario_name,
            sim_data['mode'],
            solver_param
        )
        # Return success response with the result filepath
        return "okay", 200

    except Exception:
        return traceback.format_exc(), 500


# =================================================================================
# Scenario management
# =================================================================================
@app_scenarioanalysis.route(
    "/app/scenarioanalysis/getexistingscenariolist", methods=["POST"]
)
def get_existing_scenario_list():
    filename = []
    project_name = request.json["project_name"]
    PROJECT_DIR = os.path.join(current_app.config['POLLUX_PROJECT_FOLDER'], project_name)
    for x in os.listdir(PROJECT_DIR):
        # Get the full path of the item
        full_path = os.path.join(PROJECT_DIR, x)

        # Check if it is a file, ends with '.conf', and is not 'diagram.json'
        if os.path.isfile(full_path) and x.endswith(
                ".json") and x != "diagram.json" and x != "project_info.json":
            filename.append(x[:-5])
    return jsonify(filename)


@app_scenarioanalysis.route("/app/scenarioanalysis/loadscenario", methods=["POST"])
def loadscenario():
    project_name = request.json["project_name"]
    scenario_name = request.json["scenario_name"]
    if scenario_name == "":
        scenario_name = "scenario_default"

    projectpath = os.path.join(current_app.config['POLLUX_PROJECT_FOLDER'], project_name)
    file_path = os.path.join(projectpath, f"{scenario_name}.json")

    if os.path.exists(file_path):
        with open(file_path, "r") as json_file:
            json_data = json.load(json_file)
    else:
        print(f"File {file_path} does not exist.")

    response = {
        "project_name": project_name,
        "scenario_name": scenario_name,
        "projectpath": projectpath,
        "scenario_data": json_data,
    }
    return jsonify(response)


@app_scenarioanalysis.route("/app/scenarioanalysis/save_scenario", methods=["POST"])
def save_scenario():
    try:
        project_name = request.json["project_name"]
        scenario_name = request.json["scenario_name"]
        component_parameters = request.json["component_parameters"]
        profiles_parameters = request.json["profiles_parameters"]
        optimisation_parameters = request.json["optimisation_parameters"]

        projectpath = os.path.join(current_app.config['POLLUX_PROJECT_FOLDER'], project_name)
        file_path = os.path.join(projectpath, f"{scenario_name}.json")

        # Ensure the project folder exists
        if not os.path.exists(projectpath):
            os.makedirs(projectpath)

        # Load existing data if file exists
        if os.path.exists(file_path):
            with open(file_path, "r") as json_file:
                existing_scenario_data = json.load(json_file)
        else:
            default_path = os.path.join(projectpath, "scenario_default.json")
            with open(default_path, "r") as json_file:
                existing_scenario_data = json.load(json_file)

        # Update component_parameters data
        existing_scenario_data["scenario"]["component_parameters"] = {}
        for key in component_parameters.keys():
            existing_scenario_data["scenario"]["component_parameters"][key] = \
                component_parameters[key]

        # Update optimisation parameters
        existing_scenario_data["scenario"]["optimisation_parameters"] = {}
        for key in optimisation_parameters.keys():
            existing_scenario_data["scenario"]["optimisation_parameters"][key] = \
                optimisation_parameters[key]

        # Update profiles parameters
        existing_scenario_data["scenario"]["profiles_parameters"] = {}
        for key in profiles_parameters.keys():
            existing_scenario_data["scenario"]["profiles_parameters"][key] = \
                profiles_parameters[key]

        # Save the scenario data to the JSON file
        with open(file_path, "w") as json_file:
            json.dump(existing_scenario_data, json_file, indent=4)

        # Return a success response
        return (
            jsonify(
                {
                    "message": f"Scenario '{scenario_name}' saved successfully.",
                }
            ),
            200,
        )

    except Exception as e:
        # Handle any unexpected errors
        return (
            jsonify(
                {
                    "message": "An error occurred while saving the scenario.",
                    "error": str(e),
                }
            ),
            500,
        )


@app_scenarioanalysis.route("/app/scenarioanalysis/newscenario", methods=["POST"])
def newscenario():
    project_name = request.json["project_name"]
    new_scenario_name = request.json["new_scenario_name"]
    copy_scenario_name = request.json["copy_scenario_name"]

    projectpath = os.path.join(current_app.config['POLLUX_PROJECT_FOLDER'], project_name)

    copy_conf = os.path.join(projectpath, copy_scenario_name + ".json")
    new_conf = os.path.join(projectpath, new_scenario_name + ".json")

    shutil.copyfile(copy_conf, new_conf)

    return ""


@app_scenarioanalysis.route("/app/scenarioanalysis/deletescenario", methods=["POST"])
def deletescenario():
    project_name = request.json["project_name"]
    scenario_name = request.json["scenario_name"]

    PROJECT_DIR = os.path.join(current_app.config['POLLUX_PROJECT_FOLDER'], project_name)

    os.remove(os.path.join(PROJECT_DIR, scenario_name + ".json"))

    return ""


def transform_profiles(scenario_data, sim_data):
    original_profiles = scenario_data["profiles_parameters"]
    transformed_profiles = {}
    control_length = int(np.ceil(sim_data["time_horizon"] / sim_data["control_step"]))
    for key in list(original_profiles.keys()):
        if key in ['hydrogen_storage', 'hydrogen_demand']:
            multi = 1 / 3600
        elif key in ['power_supply', 'power_demand']:
            multi = 1e6
        else:
            multi = 1

        transformed_profiles[key] = np.array(list(original_profiles[key].values())) * multi
        if sim_data["mode"] == "optimisation":
            if key in ['splitter1', 'splitter2', 'hydrogen_storage']:
                transformed_profiles[key] = np.ones(control_length) * \
                                            scenario_data["optimisation_parameters"][key][
                                                "initial_value"] * multi

        transformed_profiles[key] = transformed_profiles[key].tolist()

    return transformed_profiles
