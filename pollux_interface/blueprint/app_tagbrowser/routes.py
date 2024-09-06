from flask import Blueprint, request
from flask import current_app
import os
import json
from datetime import datetime, timezone
import pytz

# from pollux_framework.database.influxdb_driver import InfluxdbDriver

app_tagbrowser = Blueprint('app_tagbrowser', __name__)

global db_driver


# ================================================================
# API FUNCTION
# ================================================================
@app_tagbrowser.route('/app/tagbrowser/connect_database', methods=['POST'])
def connect_database():
    global db_driver

    project_name = request.json['field_name']
    database_name = request.json['database_name']

    project_folder_path = os.path.join(current_app.config['POLLUX_PROJECT_FOLDER'],
                                       project_name)
    with open(os.path.join(project_folder_path, 'plant.conf'), "r") as jsonfile:
        plant_conf = json.load(jsonfile)

    if database_name == 'influxdb':
        # db_driver = InfluxdbDriver()
        db_conf = {
            "url": os.getenv('INFLUXDB_URL', 'http://localhost:8086'),
            "org": os.getenv('INFLUXDB_ORG', 'TNO'),
            "username": os.getenv('INFLUXDB_USERNAME', 'pollux-user'),
            "password": os.getenv('INFLUXDB_PASSWORD', 'pollux-password'),
            "bucket": os.getenv('INFLUXDB_BUCKET', 'pollux-project'),
            "interval": plant_conf['database']['measured']['interval']
        }
        db_driver.update_parameters(db_conf)

    db_driver.connect()

    return database_name + ' is connected'


@app_tagbrowser.route('/app/tagbrowser/get_unitnames', methods=['POST'])
def get_unitnames():
    project_name = request.json['field_name']
    project_folder_path = os.path.join(current_app.config['POLLUX_PROJECT_FOLDER'], project_name)

    component_list = []
    for file in os.listdir(project_folder_path):
        if file.endswith('.param'):
            component_list.append(file[0:-6])

    return sorted(component_list)


@app_tagbrowser.route('/app/tagbrowser/get_tagnames', methods=['POST'])
def get_tagnames():
    global db_driver

    project_name = request.json['field_name']
    unit_name = request.json['unit_name']
    tagnames = []

    # if isinstance(db_driver, AvevaDriver):
    #     tagnames = db_driver.get_tagnames('')
    # if isinstance(db_driver, InfluxdbDriver):
    #     project_folder_path = os.path.join(current_app.config['POLLUX_PROJECT_FOLDER'],
    #                                        project_name)
    #     with open(os.path.join(project_folder_path, unit_name + '.param'), "r") as jsonfile:
    #         component_param = json.load(jsonfile)
    #
    #     for tagname in component_param['tagnames']['measured'].keys():
    #         tagnames.append(tagname + '.measured')
    #     for tagname in component_param['tagnames']['calculated'].keys():
    #         tagnames.append(tagname + '.calculated')

    return {'tagnames': sorted(tagnames)}


@app_tagbrowser.route('/app/tagbrowser/plot_tagnames', methods=['POST'])
def plot_tagnames():
    global db_driver

    unitname = request.json['unitname']
    project_name = request.json['field_name']

    start_time = request.json['starttime']
    end_time = request.json['endtime']

    tzobject = pytz.timezone('Europe/Amsterdam')

    start_time = datetime.strptime(start_time, '%Y-%m-%d %H:%M:%S')
    start_time = tzobject.localize(start_time)
    start_time = start_time.astimezone(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")

    end_time = datetime.strptime(end_time, '%Y-%m-%d %H:%M:%S')
    end_time = tzobject.localize(end_time)
    end_time = end_time.astimezone(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")

    result = []
    times_utc = []
    times_local = []

    # if isinstance(db_driver, InfluxdbDriver):
    #     tagname = request.json['tagname']
    #     result, times_utc = db_driver.read_data(project_name, unitname, tagname, start_time,
    #                                             end_time)
    #
    #
    # for time_utc in times_utc:
    #     time_local = datetime.fromisoformat(time_utc).astimezone(tzobject).strftime(
    #         "%Y-%m-%d %H:%M:%S")
    #     times_local.append(time_local)

    return {'x': times_local, 'y': result}
