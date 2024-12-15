from flask import Blueprint, request, jsonify, current_app
import os
import shutil
import json

from pollux_application.power2hydrogen.p2h2_solver import Power2Hydrogen


# Create Blueprint
app_scenarioanalysis = Blueprint("scenarioanalysis", __name__)


current_dir = os.getcwd()
pollux_main = os.path.dirname(current_dir)
PROJECT_FOLDER = os.path.join(pollux_main, "pollux-project")


# =================================================================================
# Initialization
# =================================================================================
@app_scenarioanalysis.route("/app/scenarioanalysis/get_scenario_data", methods=["POST"])
def get_scenario_data():
    project_name = request.json["project_name"]
    scenario_name = request.json["scenario_name"]

    PROJECT_DIR = os.path.join(PROJECT_FOLDER, project_name)
    file_path = os.path.join(PROJECT_DIR, scenario_name + ".json")

    with open(file_path, "r") as file:
        scenario_data = json.load(file)

    return jsonify(scenario_data["scenario"])


# =================================================================================
# Run
# =================================================================================
@app_scenarioanalysis.route("/app/scenarioanalysis/run_solver", methods=["POST"])
def run_solver():
    input_param = request.json["input_data"]
    control_parameters = input_param["control_parameters"]
    parameters = {
        "component_parameters": input_param["table_data"],
        "project_name": input_param["project_name"],
        "project_case": input_param["project_case"],
        "time_horizon": input_param["time_horizon"],
        "time_step": input_param["time_step"],
        "control_parameters": control_parameters,
        "mode": input_param["mode"],
        "optimisation_method": input_param["optimisation_method"],
    }

    app_solver = Power2Hydrogen()

    app_solver.init_parameters(parameters)

    # Define inputs
    input = {
        "time_horizon": float(input_param["time_horizon"]),
        "time_step": float(input_param["time_step"]),
        "project_case": input_param["project_case"],
        "mode": input_param["mode"],
        "optimisation_method": input_param["optimisation_method"],
        "control_parameters": control_parameters,
        "maxiter": 200,
        "finite_diff_step": 0.001,
    }

    app_solver.calculate(input)

    app_solver.get_output()

    plot_input = {"mode": input_param["mode"], "label": "rmse [MW]"}

    project_name = input_param["project_name"]
    scenario_name = input_param["scenario_name"]
    mode = input_param["mode"]

    solver_param = {"control_reshaped": app_solver.control_reshaped}

    app_solver.save_results(
        PROJECT_FOLDER, project_name, scenario_name, mode, solver_param
    )

    app_solver.plot(app_solver.outputs, app_solver.kpis, plot_input)


# =================================================================================
# Scenario management
# =================================================================================
@app_scenarioanalysis.route(
    "/app/scenarioanalysis/getexistingscenariolist", methods=["POST"]
)
def get_existing_scenario_list():
    filename = []
    project_name = request.json["project_name"]
    PROJECT_DIR = os.path.join(PROJECT_FOLDER, project_name)
    for x in os.listdir(PROJECT_DIR):
        # Get the full path of the item
        full_path = os.path.join(PROJECT_DIR, x)

        # Check if it is a file, ends with '.conf', and is not 'diagram.json'
        if os.path.isfile(full_path) and x.endswith(".json") and x != "diagram.json":
            filename.append(x[:-5])
    return jsonify(filename)


@app_scenarioanalysis.route("/app/scenarioanalysis/loadscenario", methods=["POST"])
def loadscenario():
    project_name = request.json["project_name"]
    scenario_name = request.json["scenario_name"]
    if scenario_name == "":
        scenario_name = "scenario_default"

    projectpath = os.path.join(PROJECT_FOLDER, project_name)
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
        scenario_data = request.json["scenario_data"]
        control_parameters = request.json["control_parameters"]
        project_case = request.json["project_case"]

        # Normalize project_case
        if project_case == "Power to Hydrogen":
            project_case = "power_to_hydrogen"
        elif project_case == "Power to Heat":
            project_case = "power_to_heat"

        projectpath = os.path.join(PROJECT_FOLDER, project_name)
        file_path = os.path.join(projectpath, f"{scenario_name}.json")

        # Ensure the project folder exists
        if not os.path.exists(projectpath):
            os.makedirs(projectpath)

        # Load existing data if file exists
        if os.path.exists(file_path):
            with open(file_path, "r") as json_file:
                existing_scenario_data = json.load(json_file)
        else:
            default_path = os.path.join(projectpath, f"scenario_default.json")
            with open(default_path, "r") as json_file:
                existing_scenario_data = json.load(json_file)

        # Update scenario data
        for key in scenario_data[project_case].keys():
            existing_scenario_data["scenario"][project_case][key] = scenario_data[
                project_case
            ][key]

        # Update control data
        input_profiles_keys = (
            existing_scenario_data["scenario"][project_case]
            .get("input_profiles", {})
            .keys()
        )
        control_param_keys = (
            existing_scenario_data["scenario"][project_case]
            .get("control_parameters", {})
            .keys()
        )
        for component in control_parameters.keys():
            profile_key = component + "_profile"
            if profile_key in input_profiles_keys:
                existing_scenario_data["scenario"][project_case]["input_profiles"][
                    profile_key
                ] = control_parameters[component]
            elif profile_key in control_param_keys:
                existing_scenario_data["scenario"][project_case]["control_parameters"][
                    profile_key
                ] = control_parameters[component]

        # Save the scenario data to the JSON file
        with open(file_path, "w") as json_file:
            json.dump(existing_scenario_data, json_file, indent=4)

        # Return a success response
        return (
            jsonify(
                {
                    "message": f"Scenario '{scenario_name}' saved successfully.",
                    "project_name": project_name,
                    "scenario_name": scenario_name,
                    "file_path": file_path,
                    "project_case": project_case,
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

    projectpath = os.path.join(PROJECT_FOLDER, project_name)

    copy_conf = os.path.join(projectpath, copy_scenario_name + ".json")
    new_conf = os.path.join(projectpath, new_scenario_name + ".json")

    shutil.copyfile(copy_conf, new_conf)

    return ""


@app_scenarioanalysis.route("/app/scenarioanalysis/deletescenario", methods=["POST"])
def deletescenario():

    project_name = request.json["project_name"]
    scenario_name = request.json["scenario_name"]

    PROJECT_DIR = os.path.join(PROJECT_FOLDER, project_name)

    os.remove(os.path.join(PROJECT_DIR, scenario_name + ".json"))

    return ""
