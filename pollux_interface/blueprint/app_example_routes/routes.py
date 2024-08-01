from flask import Blueprint, current_app, request, jsonify
# Import models
from pollux_framework.modules.productionwell.unit import ExampleModule

# Import packages

app_example = Blueprint('app_example', __name__)

@app_example.route('/app/app_example/load_plant', methods=['POST'])
def load_plant():
    # Retrieve values with request.json
    # project_name = request.json['field_name']

    return "OK"

@app_example.route('/app/app_example/calculate', methods=['POST'])
def calculate():
    # Calculate and return results to the js script ==> app_example_js/api.js

    return "results"