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
    const project_name = $('#project_name').val();

    if (!project_name) {
        alert("Project name is required.");
        return;
    }

    scenario_name = $('#scenarioname_list').val();

    if (scenario_name === "scenario_default") {
        alert("Can't overwrite scenario_default.");
        return;
    }

    if (confirm(`Do you want to save this scenario: ${scenario_name}?`)) {
        store_scenario(project_name, scenario_name);
    }
}


// Function store_scenario ----------------------------------------------------------
function store_scenario(project_name, scenario_name) {

    component_parameters = get_component_parameters();
    profiles_parameters = get_profiles_parameters();
    optimisation_parameters = get_optimisation_parameters();

    if (profiles_parameters == null){
        window.alert('Please upload profiles')
        return
    }

    $.ajax({
        type: 'POST',
        url: '/app/scenarioanalysis/save_scenario',
        contentType: 'application/json',
        data: JSON.stringify({
            project_name: project_name,
            scenario_name: scenario_name,
            component_parameters: component_parameters,
            profiles_parameters: profiles_parameters,
            optimisation_parameters: optimisation_parameters
        }),
        success: function (data) {
            window.alert(`${scenario_name} is saved`);
        },
        error: function (xhr, status, error) {
            window.alert("Failed to save scenario. Please try again.");
        }
    });



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


// Function open_scenario ----------------------------------------------------------
function open_scenario(scenario_name) {

    project_name = $('#project_name').val();

    if (scenario_name == '') {
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
            scenarioData = data.scenario_data.scenario;

            // Check if the case is 'power_to_hydrogen'
            if (scenarioData['project_case'] === 'power_to_hydrogen') {
                const powerToHydrogenData = scenarioData["component_parameters"];
                const tablesToUpdate = ["electrolyser_parameters", "hydrogen_storage_parameters"]

                // Loop through each table and call load_table_data
                tablesToUpdate.forEach(tableKey => {
                    const tableData = powerToHydrogenData[tableKey]; // Get the subdictionary for this table
                    load_table_data(tableKey, tableData); // Update the table with the corresponding data
                });
            } else if (scenarioData['project_case'] === 'power_to_heat') {
                const powerToHeatData = scenarioData["component_parameters"];
                const tablesToUpdate = ["heatpump_parameters", "heat_storage_parameters"]

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


// Function get_profiles_param ----------------------------------------------------------
function get_profiles_parameters() {
    local_storage_json = sessionStorage.getItem('allParsedCSVData');
    if (!local_storage_json) {
        return null;
    }

    local_storage_dict = JSON.parse(local_storage_json);
    
    console.log(local_storage_dict)
    profiles_parameters = {
        'power_supply': local_storage_dict['power_supply_profile_data'],
        'power_demand': local_storage_dict['power_demand_profile_data'],
        'hydrogen_demand': local_storage_dict['hydrogen_demand_profile_data'],
        'splitter1': local_storage_dict['splitter1_profile_data'],
        'splitter2': local_storage_dict['splitter2_profile_data'],
        'hydrogen_storage': local_storage_dict['hydrogen_storage_profile_data']
    };
    
    return profiles_parameters;
}

