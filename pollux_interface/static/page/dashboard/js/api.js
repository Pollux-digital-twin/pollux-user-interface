function loadURL(){
    var fieldID = $('#select_project').val();

    $.ajax({
        type: 'POST',
        url: '/dashboard/get_url',
        contentType: 'application/json',
        data: JSON.stringify({ field_name: fieldID }),
        success: function (data) {
            if (! data == ''){
                custom_url = window.location.protocol + "//" + window.location.hostname + ":3000/" + data

                document.getElementById('iFrame_dashboard').src = custom_url
            }
        }
    })

}

loadURL()