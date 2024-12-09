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
//                var fieldselect2 = document.getElementById('simulation_scenarioname_list');
                var fieldselect3 = document.getElementById('new_scenarioname_list');
                fieldselect.options.length = 0;
//                fieldselect2.options.length = 0;
//                fieldselect3.options.length = 0;
                for (var i = 0; i < data.length; i++) {

                    fieldselect.options[fieldselect.options.length] = new Option(data[i], data[i]);
//                    fieldselect2.options[fieldselect2.options.length] = new Option(data[i], data[i]);
                    fieldselect3.options[fieldselect3.options.length] = new Option(data[i], data[i]);
                }
            }

            $('#scenarioname_list').val(scenario_name)
//            $('#simulation_scenarioname_list').val(scenario_name)

            openScenario(scenario_name)
        }
    })
}



// Function openNewScenarioModal ----------------------------------------------------------
function openNewScenarioModal() {
    $('#myNewScenarioModal').modal('show');
}


// Function deleteScenario ----------------------------------------------------------
function deleteScenario() {

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

// Function saveScenario ----------------------------------------------------------
function saveScenario() {

    project_name = $('#project_name').val();
    if (project_name == "") {
        return
    }

    scenario_name = $('#scenarioname_list').val();
    if (scenario_name == "scenario_default") {
        var scenario_name = prompt("Can't overwrite scenario_default. Please enter new scenario name", "scenario_1");

        if (scenario_name === null) {
            return
        }
    }

    if (confirm('Do you want to save this ' + scenario_name + ' ?')) {

    } else {
        var scenario_name = prompt("Do you want to save as new scenario name?", scenario_name + "_new");

        if (scenario_name === null) {
            return
        }
    }

    storeScenario(project_name, scenario_name)

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

function extractTableData(tableRows) {
    const data = {};
    tableRows.forEach(row => {
        const keyInput = row.querySelector('td input[id$="_key"]');
        const valueInput = row.querySelector('td input[id$="_value"]');

        if (keyInput && valueInput) {
            const key = keyInput.value.trim();
            const value = valueInput.value.trim();
            if (key) { // Only include rows with a non-empty key
                data[key] = value;
            }
        }
    });
    return data;
}

function get_table_data() {
    project_case = document.getElementById('project_case').value;

    if (project_case === "Power to Hydrogen") {
        // Retrieve electrolyser parameters
        const electrolyserTableRows = document.querySelectorAll('#electrolyser_parameters tbody tr');
        const electrolyser_parameters = extractTableData(electrolyserTableRows);

        // Retrieve hydrogen storage parameters
        const hydrogenStorageTableRows = document.querySelectorAll('#hydrogen_storage_parameters tbody tr');
        const hydrogen_storage_parameters = extractTableData(hydrogenStorageTableRows);

        // Construct the table data object
        table_data = {
            'power_to_hydrogen': {
                'electrolyser_parameters': electrolyser_parameters,
                'hydrogen_storage_parameters': hydrogen_storage_parameters
                // Uncomment the following if needed
                // 'input_profiles': input_profiles,
                // 'control_parameters': control_parameters
            }
        }
    }
    return table_data;
}

// Function storeScenario ----------------------------------------------------------
function storeScenario(project_name, scenario_name) {

    table_data = get_table_data()


    $.ajax({
        type: 'POST',
        url: '/app/scenarioanalysis/save_scenario',
        contentType: 'application/json',
        data: JSON.stringify({ project_name: project_name, scenario_name: scenario_name, scenario_data: table_data}),
        success: function (data) {

            alert([scenario_name + ' is saved'])

            getExistingScenarioList(scenario_name)
        }
    })
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

// Function openScenario ----------------------------------------------------------
function openScenario(scenario_name) {

    project_name = $('#project_name').val();
//    scenario_name = $('#scenarioname_list').val();


    if (scenario_name == '') {
//        refreshParam()
        getExistingScenarioList('scenario_default')
    } else {
        loadScenario(project_name, scenario_name)
    }
};

// Function to load table data and populate it
function loadTableData(tableId, data) {
    const table = document.getElementById(tableId);

    if (table && data) {
        const tbody = table.querySelector('tbody');

        // Clear existing rows in the table
        if (tbody) {
            tbody.innerHTML = '';
        }

        // Populate the table with the provided data
        Object.keys(data).forEach((key, index) => {
            const row = document.createElement('tr');
            const keyCell = document.createElement('td');
            const valueCell = document.createElement('td');

            // Create an input field for the key
            const keyInput = document.createElement('input');
            keyInput.type = 'text';
            keyInput.className = 'form-control';
            keyInput.id = `${key}_key`;
            keyInput.value = key; // Set the input field value to the key

            // Create an input field for the value
            const valueInput = document.createElement('input');
            valueInput.type = 'text';
            valueInput.className = 'form-control';
            valueInput.id = `${key}_value`;
            valueInput.value = data[key]; // Set the input field value to the value

            // Append inputs to respective cells
            keyCell.appendChild(keyInput);
            valueCell.appendChild(valueInput);

            // Append cells to the row
            row.appendChild(keyCell);
            row.appendChild(valueCell);

            // Append the row to the table body
            tbody.appendChild(row);
        });
    } else {
        console.warn(`Table with ID "${tableId}" not found or no data provided.`);
    }
}



// Function to load the scenario and update the relevant tables
function loadScenario(project_name, scenario_name) {
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

                // Loop through each table and call loadTableData
                tablesToUpdate.forEach(tableKey => {
                    const tableData = powerToHydrogenData[tableKey]; // Get the subdictionary for this table
                    loadTableData(tableKey, tableData); // Update the table with the corresponding data
                });
            } else if (scenarioData['case'] === 'power_to_heat') {
                const powerToHeatData = scenarioData['power_to_heat'];
//                const tablesToUpdate = Object.keys(powerToHydrogenData); // Dynamic list of tables to update
                const tablesToUpdate = ["electrolyser_parameters", "hydrogen_storage_parameters", "input_profiles", "control_parameters"]

                // Loop through each table and call loadTableData
                tablesToUpdate.forEach(tableKey => {
                    const tableData = powerToHeatData[tableKey]; // Get the subdictionary for this table
                    loadTableData(tableKey, tableData); // Update the table with the corresponding data
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