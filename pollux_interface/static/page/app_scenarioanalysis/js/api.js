// ===================================================================================
//                      EVENT LISTENERS / ON-CHANGE actions
// ===================================================================================
// Listener getExistingScenarioList when page is loaded ----------------------------------------------------------
document.addEventListener("DOMContentLoaded", function () {
    initialize_page()
});

$('#project_name').on('change', function () {
    load_diagram()
})


// Listener update scenario data when scenario is changed ----------------------------------------------------------
$("#scenarioname_list").change(function () {
    scenario_name = $('#scenarioname_list').val();

    $('#simulation_scenarioname_list').val(scenario_name)

    open_scenario(scenario_name)
});


// ===================================================================================
//                                       FUNCTIONS
// ===================================================================================
function initialize_page() {
    load_diagram()

    loadScenarioAnalysisHTML()

    getExistingScenarioList('scenario_default');

}



async function loadScenarioAnalysisHTML() {
    try {
        project_case = document.getElementById("project_case_list").value
        if (!project_case) {
            console.error('Invalid project case returned. Aborting HTML load.');
            document.getElementById('scenario_analysis_table').innerHTML = 'Failed to load data.';
            return;
        }

        let apiEndpoint_2;

        // Determine the correct URL to load based on project_case
        if (
            project_case === "power_to_hydrogen"
        ) {
            apiEndpoint_2 = urlP2H2Case;
        } else if (
            project_case === "power_to_heat"
        ) {
            apiEndpoint_2 = urlP2HeatCase;
        } else {
            console.warn('Unexpected project case:', project_case);
            document.getElementById('scenario_analysis_table').innerHTML = 'Unexpected case. Please check configuration.';
            return;
        }

        // Ensure API endpoint is defined
        if (!apiEndpoint_2) {
            console.error('API endpoint is not defined.');
            document.getElementById('scenario_analysis_table').innerHTML = 'Error: Missing API endpoint.';
            return;
        }

        // Fetch and load the HTML content
        const html = await fetchWithRetry(apiEndpoint_2);
        document.getElementById('scenario_analysis_table').innerHTML = html;

        // Optional: Call additional functions if needed
        // open_scenario('scenario_default');

    } catch (error) {
        console.error('Error loading scenario analysis HTML:', error);
        document.getElementById('scenario_analysis_table').innerHTML = 'Failed to load HTML content.';
    }
}

async function fetchWithRetry(url, retries = 3) {
    for (let i = 0; i < retries; i++) {
        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error(`Fetch failed with status: ${response.status}`);
            return await response.text();
        } catch (error) {
            console.warn(`Retry ${i + 1} failed:`, error);
            if (i === retries - 1) throw error;
        }
    }
}


// Function getScenarioData ----------------------------------------------------------
function getDefaultScenarioData() {
    var project_name = $('#project_name').val();
    var scenario_name = 'scenario_default';

    return new Promise((resolve, reject) => {
        $.ajax({
            type: 'POST',
            url: '/app/scenarioanalysis/get_scenario_data',
            contentType: 'application/json',
            data: JSON.stringify({ project_name: project_name, scenario_name: scenario_name }),
            success: function (data) {
                resolve(data); // Resolve the promise with the data
            },
            error: function (xhr, status, error) {
                console.error('Error: ', error);
                console.error('Status: ', status);
                console.error('Response: ', xhr.responseText);
                reject(error); // Reject the promise with the error
            }
        });
    });
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
function print_all_cells() {
    console.log(graph.getCells())
}

// Function get_active_mode ----------------------------------------------------------
function get_active_mode() {
    const simulation_panel = document.getElementById("simulation_parameters_panel");
    const optimisation_panel = document.getElementById("optimisation_parameters_panel");

    // Determine which panel is currently visible
    if (simulation_panel.style.display === "block") {
        return "simulation";
    } else if (optimisation_panel.style.display === "block") {
        return "optimisation";
    } else {
        return null; // Neither panel is visible
    }
}

// Function run_solver ----------------------------------------------------------
async function run_solver() {
    scenario_name = $('#scenarioname_list').val();
    project_name = $('#project_name').val();

    mode = get_active_mode();
    time_horizon = parseFloat($('#time_horizon').val());
    control_step = parseFloat($('#control_step').val());

    sim_data = {
        "time_horizon": time_horizon,
        "control_step": control_step,
        "mode": mode,
    }

    if (mode == 'simulation') {
        window.alert('Running simulation with scenario: ' + scenario_name)
    } else {
        window.alert('Running optimisation with scenario: ' + scenario_name + '. It can takes several minutes, dont close this page.')
    }


    $.ajax({
        type: 'POST',
        url: '/app/scenarioanalysis/run_solver',
        contentType: 'application/json',
        data: JSON.stringify({ 'project_name': project_name, 'scenario_name': scenario_name, 'sim_data': sim_data }),
        success: function (data) {
            console.log('run_solver SUCCESS --> data = ', data)
            window.alert('Simulation is finished. Go to visualization app for the results.')
        },
        error: function (xhr, status, error) {
            window.alert('Simulation error. logfile: ' + xhr.responseText)
        }
    });
}


// Function run_solver ----------------------------------------------------------
function togglePanels() {
    // Get both panels
    const panel1 = document.getElementById("simulation_parameters_panel");
    const panel2 = document.getElementById("optimisation_parameters_panel");

    // Check which panel is currently visible
    if (panel1.style.display === "block") {
        panel1.style.display = "none";
        panel2.style.display = "block";
    } else {
        panel1.style.display = "block";
        panel2.style.display = "none";
    }
}



