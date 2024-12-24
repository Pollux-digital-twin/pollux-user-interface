get_plant_parameters()
hide_all_database_parameter_table()
get_database_parameters()

$('#select_database').on('change', function () {
    hide_all_database_parameter_table()
    get_database_parameters()
});

function hide_all_database_parameter_table() {
    document.getElementById("table-avevadb").style.display = "none"
}

function get_plant_parameters() {
    var fieldID = $('#project_name').val();

    $.ajax({
        type: 'POST',
        url: '/setting/plant/get_plant_parameters',
        contentType: 'application/json',
        data: JSON.stringify({ field_name: fieldID }),
        success: function (data) {

            document.getElementById("start_time").value = data.database.start_time
            document.getElementById("measured_interval").value = data.database.measured.interval
            document.getElementById("filtered_interval").value = data.database.filtered.interval
            document.getElementById("calculated_interval").value = data.database.calculated.interval
            document.getElementById("prediction_interval").value = data.database.prediction.interval
            document.getElementById("prediction_horizon").value = data.database.prediction.horizon

            document.getElementById("dashboard_url").value = data.dashboard.url
        }
    })
}

function get_database_parameters() {


    var fieldID = $('#project_name').val();
    var database = $('#select_database').val();

    $.ajax({
        type: 'POST',
        url: '/setting/plant/get_plant_parameters',
        contentType: 'application/json',
        data: JSON.stringify({ field_name: fieldID }),
        success: function (data) {

        }
    })
}


function save_plant_parameters() {
    var fieldID = $('#project_name').val();


    $.ajax({
        type: 'POST',
        url: '/setting/plant/get_plant_parameters',
        contentType: 'application/json',
        data: JSON.stringify({ field_name: fieldID }),
        success: function (data) {

            data.database.start_time = document.getElementById("start_time").value
            data.database.measured.interval = parseFloat(document.getElementById("measured_interval").value)
            data.database.filtered.interval = parseFloat(document.getElementById("filtered_interval").value)
            data.database.calculated.interval = parseFloat(document.getElementById("calculated_interval").value)
            data.database.prediction.interval = parseFloat(document.getElementById("prediction_interval").value)
            data.database.prediction.horizon = parseFloat(document.getElementById("prediction_horizon").value)

            data.dashboard.url = document.getElementById("dashboard_url").value

            $.ajax({
                type: 'POST',
                url: '/setting/plant/save_plant_parameters',
                contentType: 'application/json',
                data: JSON.stringify({ field_name: fieldID, parameters: data }),
                success: function (data) {
                    alert('plant parameter is saved')
                }
            })
        }
    })


}

function save_database_parameters() {
    var fieldID = $('#project_name').val();
    var database = $('#select_database').val();


    $.ajax({
        type: 'POST',
        url: '/setting/plant/get_plant_parameters',
        contentType: 'application/json',
        data: JSON.stringify({ field_name: fieldID }),
        success: function (data) {

            $.ajax({
                type: 'POST',
                url: '/setting/plant/save_plant_parameters',
                contentType: 'application/json',
                data: JSON.stringify({ field_name: fieldID, parameters: data }),
                success: function (data) {
                    alert('database parameter is saved')
                }
            })

        }
    })

}
