// ===================================================================================
//                                       FUNCTIONS
// ===================================================================================
function loadScenarioAnalysisHTML() {
    let project_case = document.getElementById('project_case').value;

    // If project_case is null or empty, update it
    if (project_case === null || project_case === "") {
        updateProjectCase(); // Assuming this function updates the project_case value
        project_case = document.getElementById('project_case').value; // Get the updated value
    }

    let apiEndpoint_2;

    // Determine the correct URL to load based on project_case
    if (project_case === "Power to Hydrogen") {
        apiEndpoint_2 = urlP2H2Case; // Use the pre-defined URL for Power to Hydrogen
    } else if (project_case === "Power to Heat") {
        apiEndpoint_2 = urlP2HeatCase; // Use the pre-defined URL for Power to Heat
    } else {
        document.getElementById('scenario_analysis_table').innerHTML = ''; // Clear the table if invalid case
        return;
    }

    // Fetch and load the HTML content
    fetch(apiEndpoint_2)
        .then(response => {
            if (!response.ok) {
                throw new Error(`Failed to fetch HTML: ${response.status}`);
            }
            return response.text();
        })
        .then(html => {
            document.getElementById('scenario_analysis_table').innerHTML = html;
        })
        .catch(error => {
            console.error('Error importing HTML file:', error);
        });
}

// Load HTML when the page is loaded
window.addEventListener('load', loadScenarioAnalysisHTML);

// Add an event listener for changes in the project_name element
document.getElementById('project_name').addEventListener('change', loadScenarioAnalysisHTML);

// Add an event listener for changes in the project_case element
document.getElementById('project_case').addEventListener('change', loadScenarioAnalysisHTML);



// Function getTableHTML ----------------------------------------------------------
function getTableHTML(projectCase) {
    if (projectCase === 'case1') {
        return `
            <table class="table">
                <thead>
                    <tr>
                        <th>Column 1</th>
                        <th>Column 2</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>Data 1.1</td>
                        <td>Data 1.2</td>
                    </tr>
                    <tr>
                        <td>Data 2.1</td>
                        <td>Data 2.2</td>
                    </tr>
                </tbody>
            </table>
        `;
    } else if (projectCase === 'case2') {
        return `
            <table class="table">
                <thead>
                    <tr>
                        <th>Column A</th>
                        <th>Column B</th>
                        <th>Column C</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>Data A1</td>
                        <td>Data B1</td>
                        <td>Data C1</td>
                    </tr>
                    <tr>
                        <td>Data A2</td>
                        <td>Data B2</td>
                        <td>Data C2</td>
                    </tr>
                </tbody>
            </table>
        `;
    } else {
        return `<p>Unknown project case: ${projectCase}</p>`;
    }
}




// Function load_diagram ----------------------------------------------------------
function load_diagram() {

    var fieldID = $('#project_name').val();

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

// Function print_all_cells ----------------------------------------------------------
function print_all_cells(){
    console.log(graph.getCells())
}

// Function run_solver ----------------------------------------------------------
function run_solver() {
    console.log('run_solver() FUNCTION CALLED');
    table_data = get_table_data()

    const profile_data = localStorage.getItem('allParsedCSVData');

    var project_case = $('#project_case').val();
    var time_horizon = $('#time_horizon').val();
    var time_step = $('#time_step').val();
    var scenario_name = $('#scenario_name').val();
    var project_name = $('#project_name').val();

    input_data = {
        "time_horizon": time_horizon,
        "time_step": time_step,
        "profile_data": profile_data,
        "table_data": table_data,
        "scenario_name": scenario_name,
        "project_name": project_name,
        "project_case": project_case
    }
    console.log('input data = ', input_data)
    $.ajax({
        type: 'POST',
        url: '/app/scenarioanalysis/run_solver',
        contentType: 'application/json',
        data: JSON.stringify({'input_data': input_data}),
        success: function (data) {
            console.log('run_solver SUCCESS --> data = ', data);

            // Retrieve the results
            var filepath = data.result;

        },
        error: function(xhr, status, error) {
            console.error('Error during download:', status, error);
        }
    });
}

// ===================================================================================
//                      EVENT LISTENERS / ON-CHANGE actions
// ===================================================================================
updateProjectCase()

load_diagram()
$('#project_name').on('change', function () {
    load_diagram()
})



// Listener update scenario data when scenario is changed ----------------------------------------------------------
$("#scenarioname_list").change(function () {
    scenario_name = $('#scenarioname_list').val();
    $('#simulation_scenarioname_list').val(scenario_name)

    updateProjectCase().then(project_case => {
    });


    openScenario(scenario_name)
});

// Listener getExistingScenarioList when page is loaded ----------------------------------------------------------
document.addEventListener("DOMContentLoaded", function() {
//    Update the dropdown menu with scenarios
    getExistingScenarioList('scenario_default');
    document.getElementById('scenarioname_list').value = 'scenario_default';
});


//// On change ----------------------------------------------------------
//$('#scenariofile').on('change', function () {
//
//    var form_data = new FormData()
//    form_data.append('file', $('#scenariofile')[0].files[0])
//    form_data.append('project_name', project_name)
//
//    var fullPath = $('#scenariofile').val();
//    var startIndex = (fullPath.indexOf('\\') >= 0 ? fullPath.lastIndexOf('\\') : fullPath.lastIndexOf('/'));
//    var filename = fullPath.substring(startIndex + 1,fullPath.length-5);
//
//    $.ajax({
//        type: 'POST',
//        url: '/importscenario',
//        dataType: 'json',
//        cache: false,
//        contentType: false,
//        processData: false,
//        data: form_data,
//        success: function (response) {
//            getExistingScenarioList(filename)
//
//            alert(response)
//        }
//    })
//
//});