function get_project_list() {
    $.ajax({
        type: 'GET',
        url: '/getprojectlist',
        success: function (data) {

            if (data != null) {
                var fieldselect = document.getElementById('project_name_list');
                fieldselect.options.length = 1;
                for (var i = 0; i < data.length; i++) {
                    fieldselect.options[fieldselect.options.length] = new Option(data[i], data[i]);
                }
            }
        }
    });
}

get_project_list()


function create_new_project() {
    project_name = document.getElementById("select_project").value
    if (project_name == "") {
        value = true
    }else{
        value = confirm("Do you want to create a new project? You will lose your current project.")
    }
    if (value == true) {
        project_name = window.prompt("What is the project name?", "project1");

       

        $.ajax({
            type: 'POST',
            url: '/createproject',
            contentType: 'application/json',
            data: JSON.stringify({ project_name: project_name }),
            success: function (data) {

                window.alert(data)

                document.getElementById("select_project").value = project_name

                window.location.reload()
            }
        })

    }
}

function save_project() {
    project_name = document.getElementById("select_project").value

    if (project_name == "") {
        project_name = window.prompt("What is the project name?", "project1");
    }


    $.ajax({
        type: 'POST',
        url: '/saveproject',
        contentType: 'application/json',
        data: JSON.stringify({ projectname: project_name, layerdata: '' }),
        success: function (data) {
            window.alert(data);

            document.getElementById("select_project").value = project_name

            window.location.reload()
        }
    })



}

function close_project() {
    project_name = document.getElementById("select_project").value

    if (project_name == "") {
        return
    }

    $.ajax({
        type: 'POST',
        url: '/closeproject',
        contentType: 'application/json',
        data: JSON.stringify({ project_name: project_name}),
        success: function (data) {
            window.alert(data);

            document.getElementById("select_project").value = ""

            window.location.reload()
        }
    })



}

function delete_project() {
    project_name = document.getElementById("select_project").value

    if (project_name == "") {
        return
    }
    value = confirm("Do you want to delete " + project_name +"? This action can't be undone.")
    if (value == true) {
        $.ajax({
            type: 'POST',
            url: '/deleteproject',
            contentType: 'application/json',
            data: JSON.stringify({ project_name: project_name }),
            success: function (data) {


                window.alert(data);

                document.getElementById("select_project").value = ""

                window.location.reload()

            }
        })
    }



}

function open_project() {
    project_name = document.getElementById('project_name_list').value;

    if (project_name) {
        document.getElementById("select_project").value = project_name

        
        $.ajax({
            type: 'POST',
            url: '/loadproject',
            contentType: 'application/json',
            data: JSON.stringify({ project_name: project_name }),
            success: function (data) {

                $('#myProjectModal').modal('hide');

                alert('project is loaded successfully.')

                window.location.reload()

            
            }
        });

    }


}



