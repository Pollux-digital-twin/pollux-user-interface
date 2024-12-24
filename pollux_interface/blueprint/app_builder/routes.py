from flask import Blueprint, request, jsonify
from flask import current_app
import os
import json

app_builder = Blueprint("app_builder", __name__)

ALLOWED_EXTENSIONS = set(["csv"])


def allowed_file(filename):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS


# ================================================================
# API FUNCTION
# ================================================================


@app_builder.route("/app/builder/save_diagram", methods=["POST"])
def save_diagram():
    diagram = request.json["diagram"]
    project_name = request.json["field_name"]
    project_folder_path = os.path.join(
        current_app.config["POLLUX_PROJECT_FOLDER"], project_name
    )

    diagram_json = json.dumps(diagram, indent=4, sort_keys=True)
    with open(os.path.join(project_folder_path, "diagram.json"), "w") as jsonfile:
        jsonfile.write(diagram_json)

    for file in os.listdir(project_folder_path):
        if file.endswith(".param"):
            os.remove(os.path.join(project_folder_path, file))

    for component in diagram["cells"]:
        if (component["type"] == "devs.Link") or (
            component["type"] == "standard.Circle"
        ):
            continue

        if "name" in component["parameters"].keys():
            component_name = component["parameters"]["name"]
        else:
            component_name = (
                component["parameters"]["type"] + "_" + component["id"][0:4]
            )
            component["parameters"]["name"] = component_name

        component_content = dict()
        component_content["id"] = component["id"]
        component_content["name"] = component_name
        component_content["parameters"] = component["parameters"]
        component_content["tagnames"] = component["tagnames"]

        with open(
            os.path.join(project_folder_path, component_name + ".param"), "w"
        ) as jsonfile:
            jsonfile.write(json.dumps(component_content, indent=4, sort_keys=True))

    return jsonify("diagram is saved")


@app_builder.route("/app/builder/load_diagram", methods=["POST"])
def load_diagram():
    project_name = request.json["field_name"]
    project_folder_path = os.path.join(
        current_app.config["POLLUX_PROJECT_FOLDER"], project_name
    )

    if os.path.exists(os.path.join(project_folder_path, "diagram.json")):
        with open(os.path.join(project_folder_path, "diagram.json"), "r") as jsonfile:
            diagram = json.load(jsonfile)
    else:
        diagram = {"cells": {}}

    for component in diagram["cells"]:
        if (component["type"] == "devs.Link") or (
            component["type"] == "standard.Circle"
        ):
            continue

        if "name" in component["parameters"].keys():
            component_name = component["parameters"]["name"]
        else:
            component_name = (
                component["parameters"]["type"] + "_" + component["id"][0:4]
            )
            component["parameters"]["name"] = component_name

        with open(
            os.path.join(project_folder_path, component_name + ".param"), "r"
        ) as jsonfile:
            component_content = json.load(jsonfile)

        component["id"] = component_content["id"]
        component["parameters"] = component_content["parameters"]
        component["tagnames"] = component_content["tagnames"]

    # Update the diagram.json with the given component names
    diagram_json = json.dumps(diagram, indent=4, sort_keys=True)
    with open(os.path.join(project_folder_path, "diagram.json"), "w") as jsonfile:
        jsonfile.write(diagram_json)

    return jsonify(diagram)
