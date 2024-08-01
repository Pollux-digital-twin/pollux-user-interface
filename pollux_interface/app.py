# If the app.py can not be run, set the PYTHONPATH with the following line
# set PYTHONPATH=C:\GIT\Pollux\pollux-user-interface

from pollux_interface.create_app import create_app
import os

if __name__ == '__main__':
    app = create_app()

    app.run(host='0.0.0.0', port=os.getenv('POLLUX_FRONTEND_PORT', 5445), debug=True)
