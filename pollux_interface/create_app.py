"""
create_app.py
====================================
"""

from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager, current_user
from flask_session import Session
import os
from pathlib import Path
import sys
from flask_admin import Admin
from flask_admin.contrib.sqla import ModelView
from flask_migrate import Migrate
from werkzeug.security import generate_password_hash

db = SQLAlchemy()

pollux_root_dir = Path(__file__).parents[2]

if not os.path.exists(os.path.join(pollux_root_dir, 'pollux-project')):
    os.mkdir(os.path.join(pollux_root_dir, 'pollux-project'))


def create_app():
    """
    Function to create webapp using Flask and importing the blueprints

    """
    app = Flask(__name__)

    app.config['SECRET_KEY'] = b'0\xbf\xb6\x04q\xf2\x12,\xfa\xfa\xf8T'
    app.config['SQLALCHEMY_DATABASE_URI'] = \
        f"mysql://root:root@{os.getenv('POLLUX_MYSQLDB_URL', 'localhost')}:3306/polluxdb"
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

    app.config["SESSION_PERMANENT"] = False
    app.config["SESSION_TYPE"] = "filesystem"

    app.config['POLLUX_PROJECT_FOLDER'] = \
        os.getenv('POLLUX_PROJECT_FOLDER', os.path.join(pollux_root_dir, 'pollux-project'))
    app.config['POLLUX_DOCUMENTATION_FOLDER'] = \
        os.getenv('POLLUX_DOCUMENTATION_FOLDER',
                  os.path.join(pollux_root_dir, 'pollux-documentation'))

    sys.path.append(os.getenv('POLLUX_FRAMEWORK_FOLDER',
                              os.path.join(pollux_root_dir, 'pollux-framework',
                                           'pollux_interface')))

    Session(app)

    db.init_app(app)

    login_manager = LoginManager()
    login_manager.login_view = 'auth.login'
    login_manager.init_app(app)

    from pollux_interface.blueprint.dbmodels import User, Project

    @login_manager.user_loader
    def load_user(user_id):
        # since the user_id is just the primary key of our user table,
        # use it in the query for the user
        return User.query.get(int(user_id))

    # for admin manager
    app.config['FLASK_ADMIN_SWATCH'] = 'slate'

    class UserModelView(ModelView):
        can_create = False
        column_exclude_list = ['password']

        def is_accessible(self):
            return current_user.is_authenticated and current_user.role == "admin"

    class ProjectModelView(ModelView):
        def is_accessible(self):
            return current_user.is_authenticated and current_user.role == "admin"

    admin = Admin(app, name='Admin Manager', template_mode='bootstrap4')
    admin.add_view(UserModelView(User, db.session))
    admin.add_view(ProjectModelView(Project, db.session))

    # for migration database
    Migrate(app, db)

    # blueprint for auth routes in our app
    from pollux_interface.blueprint.auth.routes import auth as auth_blueprint
    app.register_blueprint(auth_blueprint)

    # blueprint for project routes in our app
    from pollux_interface.blueprint.project.routes import projectmanager as projectmanager_blueprint
    app.register_blueprint(projectmanager_blueprint)

    # blueprint for pages route
    from pollux_interface.blueprint.routes import main as main_blueprint
    app.register_blueprint(main_blueprint)

    # blueprint for builder routes in our app
    from pollux_interface.blueprint.app_builder.routes import app_builder as app_builder_blueprint
    app.register_blueprint(app_builder_blueprint)

    # blueprint for setting plant routes in our app
    from pollux_interface.blueprint.setting_plant.routes import \
        setting_plant as setting_plant_blueprint
    app.register_blueprint(setting_plant_blueprint)

    # blueprint for app tagbrowser routes in our app
    from pollux_interface.blueprint.app_tagbrowser.routes import \
        app_tagbrowser as app_tagbrowser_blueprint
    app.register_blueprint(app_tagbrowser_blueprint)

    # blueprint for app dashboard routes in our app
    from pollux_interface.blueprint.dashboard.routes import dashboard \
        as dashboard_blueprint
    app.register_blueprint(dashboard_blueprint)

    with app.app_context():
        db.create_all()
        user = User.query.filter_by(email="admin@localhost").first()
        if not user:
            new_user = User(email=os.getenv('POLLUX_ADMIN_EMAIL', "admin@localhost"),
                            name=os.getenv('POLLUX_ADMIN_NAME', "admin"),
                            password=generate_password_hash(
                                os.getenv('POLLUX_ADMIN_PASSWORD', "Admin123456!@#$"),
                                method='scrypt'), role="admin")
            db.session.add(new_user)
            db.session.commit()

    return app
