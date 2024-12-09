from flask import Blueprint, request, jsonify, session
from flask import current_app
import os
import shutil
from pollux_interface.blueprint.dbmodels import Project
from flask_login import current_user
from pollux_interface.create_app import db

projectmanager = Blueprint('projectmanager', __name__)


@projectmanager.route('/closeproject', methods=['POST'])
def closeproject():
    project_name = request.json['project_name']

    session["project_name"] = ''

    return project_name + " is closed."


@projectmanager.route('/loadproject', methods=['POST'])
def loadproject():
    project_name = request.json['project_name']

    session["project_name"] = project_name

    return project_name + " is loaded."


@projectmanager.route('/createproject', methods=['POST'])
def createproject():
    project_name = request.json['project_name']

    if project_name == '':
        return "ERROR: Please fill in your project name."

    project_folder_path = os.path.join(current_app.config['POLLUX_PROJECT_FOLDER'], project_name)

    if os.path.isdir(project_folder_path):
        return project_name + " already exists."
    else:
        os.mkdir(project_folder_path)

    template_folder_path = os.path.join(current_app.config['POLLUX_PROJECT_FOLDER'], '_template')
    shutil.copy(os.path.join(template_folder_path, 'template_plant.conf'),
                os.path.join(project_folder_path, 'plant.conf'))

    session["project_name"] = project_name

    new_project = Project(name=project_name, user=current_user.name)

    db.session.add(new_project)
    db.session.commit()

    return project_name + " is created."


@projectmanager.route('/getprojectlist', methods=['GET'])
def getprojectlist():
    project_names = []

    if current_user.role == 'admin':
        projects = Project.query.all()
        for project in projects:
            project_names.append(project.name)
    else:
        projects = Project.query.filter_by(user=current_user.name).all()
        for project in projects:
            if project.name not in project_names:
                project_names.append(project.name)

        projects = Project.query.filter_by(group=current_user.group).all()
        for project in projects:
            if project.name not in project_names:
                project_names.append(project.name)

    return jsonify(project_names)


@projectmanager.route('/deleteproject', methods=['POST'])
def deleteproject():
    projectname = request.json['project_name']

    project = Project.query.filter_by(name=projectname).first()

    # delete the project
    if project:
        db.session.delete(project)
        db.session.commit()

        session["project_name"] = ''

        project_folder_path = os.path.join(current_app.config['POLLUX_PROJECT_FOLDER'],
                                           projectname)

        if os.path.isdir(project_folder_path):
            shutil.rmtree(project_folder_path)

    else:
        return projectname + " does not exist."

    return projectname + " is deleted."