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
    new_project_name = document.getElementById("new_project_name").value
    if (new_project_name == "") {
        return
    }
    project_case = document.getElementById("project_case_list").value

    $.ajax({
        type: 'POST',
        url: '/createproject',
        contentType: 'application/json',
        data: JSON.stringify({ project_name: new_project_name, project_case: project_case }),
        success: function (data) {

            window.alert(data)

            window.location.reload()
        }
    })


}





function delete_project() {
    project_name = document.getElementById("project_name").value

    if (project_name == "") {
        return
    }
    value = confirm("Do you want to delete " + project_name + "? This action can't be undone.")
    if (value == true) {
        $.ajax({
            type: 'POST',
            url: '/deleteproject',
            contentType: 'application/json',
            data: JSON.stringify({ project_name: project_name }),
            success: function (data) {


                window.alert(data);

                window.location.reload()

            }
        })
    }

}

function open_project() {
    project_name = document.getElementById('project_name_list').value;

    if (project_name) {
        document.getElementById("project_name").value = project_name


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
