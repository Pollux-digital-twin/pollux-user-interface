connect_database()


$('#select_database').on('change', function () {
    connect_database()
});



function connect_database() {

    clear_unitnames()
    clear_tagnames()

    var fieldID = $('#select_project').val();
    var database = $('#select_database').val();


    get_unitnames()


    $.ajax({
        type: 'POST',
        url: '/app/tagbrowser/connect_database',
        contentType: 'application/json',
        data: JSON.stringify({ field_name: fieldID, database_name: database }),
        success: function (data) {


            get_tagnames()

        }
    })
}

function get_unitnames() {
    var fieldID = $('#select_project').val();

    $.ajax({
        type: 'POST',
        url: '/app/tagbrowser/get_unitnames',
        contentType: 'application/json',
        data: JSON.stringify({ field_name: fieldID }),
        success: function (data) {
            var fieldselect = document.getElementById('select_unitnames');
            fieldselect.options.length = 1;
            for (var i = 0; i < data.length; i++) {
                fieldselect.options[fieldselect.options.length] = new Option(data[i], data[i]);
            }
        }
    })

}

function clear_tagnames() {
    fieldselect = document.getElementById('select_tagnames');
    fieldselect.options.length = 1;
}
function clear_unitnames() {
    fieldselect = document.getElementById('select_unitnames');
    fieldselect.options.length = 1;
}

$('#select_unitnames').on('change', function () {
    get_tagnames()
});



function get_tagnames() {
    var unitname = $('#select_unitnames').val();
    var fieldID = $('#select_project').val();
    console.log(unitname)
    $.ajax({
        type: 'POST',
        url: '/app/tagbrowser/get_tagnames',
        contentType: 'application/json',
        data: JSON.stringify({ field_name: fieldID, unit_name: unitname }),
        success: function (data) {
            var fieldselect = document.getElementById('select_tagnames');
            fieldselect.options.length = 1;
            for (var i = 0; i < data.tagnames.length; i++) {
                fieldselect.options[fieldselect.options.length] = new Option(data.tagnames[i], data.tagnames[i]);
            }
        }
    })

}

function plot_tagname() {
    var layout = {
        plot_bgcolor: "#27293D",
        paper_bgcolor: "#27293D",
        font: { color: "#D2D2D5" }
    }

    Plotly.newPlot('div_plot_tagname', [], layout)

    var fieldID = $('#select_project').val();
    var tagname = $('#select_tagnames').val();
    var unitname = $('#select_unitnames').val();
    var starttime = document.getElementById("starttime").value;
    var endtime = document.getElementById("endtime").value;

    $.ajax({
        type: 'POST',
        url: '/app/tagbrowser/plot_tagnames',
        contentType: 'application/json',
        data: JSON.stringify({ field_name: fieldID, tagname: tagname, unitname: unitname, starttime: starttime, endtime: endtime }),
        success: function (data) {

            trace = {
                x: data.x,
                y: data.y,
                name: tagname,
            }

            layout['title'] = { text: tagname }

            Plotly.addTraces('div_plot_tagname', trace);
        }
    })

}