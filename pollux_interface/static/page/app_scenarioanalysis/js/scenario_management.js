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
function save_scenario() {

    project_name = $('#project_name').val();
    if (project_name == "") {
        return
    }

    scenario_name = $('#scenarioname_list').val();
    if (scenario_name == "scenario_default") {
        var scenario_name = prompt("Can't overwrite scenario_default. Please enter new scenario name", "scenario_1");
            store_scenario(project_name, scenario_name)
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

    store_scenario(project_name, scenario_name)

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


// Function store_scenario ----------------------------------------------------------
function store_scenario(project_name, scenario_name) {

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
                tablesToUpdate.forEach(tableKey => {
                    const tableData = powerToHydrogenData[tableKey]; // Get the subdictionary for this table
                    load_table_data(tableKey, tableData); // Update the table with the corresponding data
                });
            } else if (scenarioData['case'] === 'power_to_heat') {
                const powerToHeatData = scenarioData['power_to_heat'];
//                const tablesToUpdate = Object.keys(powerToHydrogenData); // Dynamic list of tables to update
                const tablesToUpdate = ["electrolyser_parameters", "hydrogen_storage_parameters", "input_profiles", "control_profiles"]

                // Loop through each table and call load_table_data
                tablesToUpdate.forEach(tableKey => {
                    const tableData = powerToHeatData[tableKey]; // Get the subdictionary for this table
                    load_table_data(tableKey, tableData); // Update the table with the corresponding data
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