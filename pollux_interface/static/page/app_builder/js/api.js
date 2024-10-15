function save_diagram() {

    var jsonObject = graph.toJSON();

    var fieldID = $('#select_project').val();
    if (fieldID) {
        $.ajax({
            type: 'POST',
            url: '/app/builder/save_diagram',
            contentType: 'application/json',
            data: JSON.stringify({ field_name: fieldID, diagram: jsonObject }),
            success: function (data) {
                alert('diagram is saved')
            }
        })
    }

}

function load_diagram() {

    var fieldID = $('#select_project').val();

    if (fieldID) {
        $.ajax({
            type: 'POST',
            url: '/app/builder/load_diagram',
            contentType: 'application/json',
            data: JSON.stringify({ field_name: fieldID }),
            success: function (data) {

                graph.fromJSON(data)

                

            },
            error: function () {
                graph.fromJSON({ "cells": [] })
            }
        })
    }

}

$('#select_project').on('change', function () {
    load_diagram()
})


load_diagram()



function print_all_cells(){
    console.log(graph.getCells())
}
