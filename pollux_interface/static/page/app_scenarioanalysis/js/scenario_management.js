// Function getExistingScenarioList ----------------------------------------------------------
function getExistingScenarioList(scenario_name) {
    project_name = $('#project_name').val();
    if (project_name == "") {
        return
    }


    $.ajax({
        type: 'POST',
        url: '/app/scenarioanalysis/getexistingscenariolist',
        contentType: 'application/json',
        data: JSON.stringify({ project_name: project_name }),
        success: function (data) {
            if (data != null) {

                var fieldselect = document.getElementById('scenarioname_list');
                var fieldselect3 = document.getElementById('new_scenarioname_list');
                fieldselect.options.length = 0;

                for (var i = 0; i < data.length; i++) {

                    fieldselect.options[fieldselect.options.length] = new Option(data[i], data[i]);
                    fieldselect3.options[fieldselect3.options.length] = new Option(data[i], data[i]);
                }
            }

            $('#scenarioname_list').val(scenario_name)

            open_scenario(scenario_name)
        }
    })
}



// Function openNewScenarioModal ----------------------------------------------------------
function openNewScenarioModal() {
    $('#myNewScenarioModal').modal('show');
}


// Function delete_scenario ----------------------------------------------------------
function delete_scenario() {

    project_name = $('#project_name').val();
    if (project_name == "") {
        return
    }

    scenario_name = $('#scenarioname_list').val();
    if (scenario_name == "scenario_default") {
        alert("Can't  delete scenario_default.");

        return
    }

    if (confirm('Do you want to delete this ' + scenario_name + ' ?')) {

    } else {
        return
    }



    $.ajax({
        type: 'POST',
        url: '/app/scenarioanalysis/deletescenario',
        contentType: 'application/json',
        data: JSON.stringify({ project_name: project_name, scenario_name: scenario_name }),
        success: function (data) {

            alert([scenario_name + ' is deleted'])

            getExistingScenarioList('scenario_default')


        }
    })

}

// Function save_scenario ----------------------------------------------------------
async function save_scenario() {
    const mode = get_active_mode();
    const project_name = $('#project_name').val();

    if (!project_name) {
        alert("Project name is required.");
        return;
    }

    let scenario_name = $('#scenarioname_list').val();

    if (scenario_name === "scenario_default") {
        scenario_name = prompt("Can't overwrite scenario_default. Please enter a new scenario name", "scenario_1");

        if (!scenario_name) {
            alert("Scenario name is required.");
            return;
        }

        await store_scenario(project_name, scenario_name, mode);
        alert(`${scenario_name} has been saved successfully.`);
        return;
    }

    if (confirm(`Do you want to save this scenario: ${scenario_name}?`)) {
        await store_scenario(project_name, scenario_name, mode);
        alert(`${scenario_name} has been saved successfully.`);
        return;
    } else {
        const new_scenario_name = prompt("Do you want to save as a new scenario name?", `${scenario_name}_new`);

        if (!new_scenario_name) {
            alert("Scenario name is required.");
            return;
        }

        scenario_name = new_scenario_name;
        await store_scenario(project_name, scenario_name, mode);
        alert(`${scenario_name} has been saved successfully.`);
    }
}


// Function store_scenario ----------------------------------------------------------
async function store_scenario(project_name, scenario_name, mode) {
    try {
        const table_data = await get_table_data();
        const control_parameters = await get_control_param(mode);
        const project_case = $('#project_case').val();

        const response = await $.ajax({
            type: 'POST',
            url: '/app/scenarioanalysis/save_scenario',
            contentType: 'application/json',
            data: JSON.stringify({
                project_name: project_name,
                scenario_name: scenario_name,
                scenario_data: table_data,
                project_case: project_case,
                control_parameters: control_parameters,
                mode: mode
            })
        });

        alert(`${scenario_name} is saved`);
        getExistingScenarioList(scenario_name);
    } catch (error) {
        console.error("Error saving scenario:", error);
        console.error("Error details:", {
            status: error.status,
            statusText: error.statusText,
            responseText: error.responseText,
        });
        alert("Failed to save scenario. Please try again.");
    }
}


// Function addScenario ----------------------------------------------------------
function addScenario() {

    project_name = $('#project_name').val();

    new_scenario_name = document.getElementById("new_scenarioname").value;

    copy_scenario_name = document.getElementById("new_scenarioname_list").value;

    if (new_scenario_name === null) {
        alert("Please enter scenario name.")
        return
    }

    $.ajax({
        type: 'POST',
        url: '/app/scenarioanalysis/newscenario',
        contentType: 'application/json',
        data: JSON.stringify({ project_name: project_name, new_scenario_name: new_scenario_name, copy_scenario_name: copy_scenario_name }),
        success: function (data) {

            $('#myNewScenarioModal').modal('hide');

            alert([new_scenario_name + ' is created'])

            getExistingScenarioList(new_scenario_name)


        }
    })


}

// Function extractIdValuePairs ----------------------------------------------------------
function extractIdValuePairs(data) {
    const dictionary = {};

    data.forEach(pair => {
        if (pair.length === 2) {
            // Parse the HTML strings into DOM elements
            const keyElementContainer = document.createElement('div');
            keyElementContainer.innerHTML = pair[0].trim();
            const keyElement = keyElementContainer.firstChild;

            const valueElementContainer = document.createElement('div');
            valueElementContainer.innerHTML = pair[1].trim();
            const valueElement = valueElementContainer.firstChild;

            // Extract 'id' from the first input and 'value' from the second input
            const key = keyElement?.getAttribute('id');
            const value = valueElement?.getAttribute('value');

            // Add to dictionary if both key and value exist
            if (key && value) {
                dictionary[key] = value;
            }
        }
    });

    return dictionary;
}

// Function importScenario ----------------------------------------------------------
function importScenario() {
    project_name = $('#project_name').val();
    if (project_name == "") {
        return
    }

    $.ajax({
        type: 'POST',
        url: '/importcenario',
        contentType: 'application/json',
        data: JSON.stringify({ project_name: project_name}),
        success: function (data) {
            alert('Scenario is imported');
        }
    })
}

// Function open_scenario ----------------------------------------------------------
function open_scenario(scenario_name) {

    project_name = $('#project_name').val();
//    scenario_name = $('#scenarioname_list').val();


    if (scenario_name == '') {
//        refreshParam()
        getExistingScenarioList('scenario_default')
    } else {
        load_scenario(project_name, scenario_name)
    }
};



// Function to load the scenario and update the relevant tables
function load_scenario(project_name, scenario_name) {
    $.ajax({
        type: 'POST',
        url: '/app/scenarioanalysis/loadscenario',
        contentType: 'application/json',
        data: JSON.stringify({ project_name: project_name, scenario_name: scenario_name }),
        success: function (data) {
            const projectName = data.project_name;
            const scenarioName = data.scenario_name;
            const projectPath = data.projectpath;
            const scenarioData = data.scenario_data.scenario;

            // Check if the case is 'power_to_hydrogen'
            if (scenarioData['case'] === 'power_to_hydrogen') {
                const powerToHydrogenData = scenarioData['power_to_hydrogen'];
//                const tablesToUpdate = Object.keys(powerToHydrogenData); // Dynamic list of tables to update
                const tablesToUpdate = ["electrolyser_parameters", "hydrogen_storage_parameters"]

                // Loop through each table and call load_table_data
                tablesToUpdate.forEach(tableID => {
                    const tableData = powerToHydrogenData[tableID]; // Get the subdictionary for this table
                    load_table_data(tableID, tableData); // Update the table with the corresponding data
                });
            } else if (scenarioData['case'] === 'power_to_heat') {
                const powerToHeatData = scenarioData['power_to_heat'];
//                const tablesToUpdate = Object.keys(powerToHydrogenData); // Dynamic list of tables to update
                const tablesToUpdate = ["heatpump_parameters"]

                // Loop through each table and call load_table_data
                tablesToUpdate.forEach(tableID => {
                    const tableData = powerToHeatData[tableID]; // Get the subdictionary for this table
                    load_table_data(tableID, tableData); // Update the table with the corresponding data
                });
            } else {
                console.warn("The scenario case is not 'power_to_hydrogen'. No tables to update.");
            }
        },
        error: function (xhr, status, error) {
            console.error("An error occurred while loading the scenario:", error);
        }
    });
}


// Function getScenarioData ----------------------------------------------------------
function getScenarioData(scenario_name) {
    var project_name = $('#project_name').val();
    if (scenario_name == null && scenario_name == "") {
        var scenario_name = $('#scenarioname_list').val();
    }

    console.log("Scenario name is:", scenario_name);

    if (scenario_name != null && scenario_name !== "") {
        return new Promise((resolve, reject) => {
            $.ajax({
                type: 'POST',
                url: '/app/scenarioanalysis/get_scenario_data',
                contentType: 'application/json',
                data: JSON.stringify({ project_name: project_name, scenario_name: scenario_name }),
                success: function (data) {
                    console.log('data = ', data);
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
    } else {
        return Promise.reject("Scenario name is null or empty."); // Reject if scenario name is invalid
    }
}


// Function get_control_param ----------------------------------------------------------
async function get_control_param(mode) {
    const local_storage_json = localStorage.getItem('allParsedCSVData');
    if (!local_storage_json) {
        console.error("No data found in local storage.");
        alert("No data found in local storage.");
        return null;
    }

    const local_storage_dict = JSON.parse(local_storage_json);
    let control_parameters;

    const required_components = ['power_supply', 'power_demand', 'hydrogen_demand', 'splitter1', 'splitter2', 'hydrogen_storage'];
    let missing_components = [];

    if (mode === "simulation") {
        control_parameters = {
            'power_supply': await Promise.resolve(local_storage_dict['power_supply_profile_data']),
            'power_demand': await Promise.resolve(local_storage_dict['power_demand_profile_data']),
            'hydrogen_demand': await Promise.resolve(local_storage_dict['hydrogen_demand_profile_data']),
            'splitter1': await Promise.resolve(local_storage_dict['splitter1_control_profile_data']),
            'splitter2': await Promise.resolve(local_storage_dict['splitter2_control_profile_data']),
            'hydrogen_storage': await Promise.resolve(local_storage_dict['hydrogen_storage_profile_data'])
        };
    } else if (mode === "optimisation") {
        const optimisation_method = $('#optimisation_method').val();
        const optimisation_parameters = await get_optimisation_parameters();

        control_parameters = {
            'power_supply': await Promise.resolve(local_storage_dict['power_supply_profile_data']),
            'power_demand': await Promise.resolve(local_storage_dict['power_demand_profile_data']),
            'hydrogen_demand': await Promise.resolve(local_storage_dict['hydrogen_demand_profile_data']),
            'splitter1': await Promise.resolve(optimisation_parameters['splitter1']),
            'splitter2': await Promise.resolve(optimisation_parameters['splitter2']),
            'hydrogen_storage': await Promise.resolve(optimisation_parameters['hydrogen_storage'])
        };
    } else {
        console.error("Invalid mode provided. Expected 'simulation' or 'optimisation'.");
        alert("Invalid mode provided. Expected 'simulation' or 'optimisation'.");
        return null;
    }

    // Check for missing components
    required_components.forEach(component => {
        if (!control_parameters[component]) {
            missing_components.push(component);
        }
    });

    if (missing_components.length > 0) {
        const missingList = missing_components.map(component => `- ${component}`).join('\n');
        alert(`Control parameters for the following components are missing:\n${missingList}`);
        console.error(`Missing components:\n${missingList}`);
        return control_parameters;
    }

    return control_parameters;
}

