// Function get_table_data ----------------------------------------------------------
function get_component_parameters() {
    project_case = document.getElementById('project_case').value;

    if (project_case === "power_to_hydrogen") {
        // Retrieve electrolyser parameters
        const electrolyserTableRows = document.querySelectorAll('#electrolyser_parameters tbody tr');
        const electrolyser_parameters = extract_table_data(electrolyserTableRows);

        // Retrieve hydrogen storage parameters
        const hydrogenStorageTableRows = document.querySelectorAll('#hydrogen_storage_parameters tbody tr');
        const hydrogen_storage_parameters = extract_table_data(hydrogenStorageTableRows);

        // Construct the table data object
        table_data = {
            'electrolyser_parameters': electrolyser_parameters,
            'hydrogen_storage_parameters': hydrogen_storage_parameters
        }
    } else if (project_case === "power_to_heat") {
        // Retrieve heatpump parameters
        const heatpumpTableRows = document.querySelectorAll('#heatpump_parameters tbody tr');
        const heatpump_parameters = extract_table_data(heatpumpTableRows);

        // Retrieve heat storage parameters
//        const heatstorageTableRows = document.querySelectorAll('#heat_storage_parameters tbody tr');
//        const heat_storage_parameters = extract_table_data(heatstorageTableRows);

        // Construct the table data object
        table_data = {
            'heatpump_parameters': heatpump_parameters,
//            'heatstorage_parameters': heat_storage_parameters
        }
    }
    return table_data;
}

// Function extract_table_data ----------------------------------------------------------
function extract_table_data(tableRows) {
    const data = {};
    tableRows.forEach(row => {
        const keyInput = row.querySelector('td output[id$="_key"]');
        const valueInput = row.querySelector('td input[id$="_value"]');

        if (keyInput && valueInput) {
            const key = keyInput.id.replace(/_key$/, '').trim();
            const value = valueInput.value.trim();
            if (key) { // Only include rows with a non-empty key
                if (key != 'cell_type') {
                    data[key] = parseFloat(value);
                } else {
                    data[key] = value;
                }
            }
        }
    });
    return data;
}


// Function get_optimisation_parameters ----------------------------------------------------------
function get_optimisation_parameters() {

    // Retrieve optimisation parameters
    const optparamTableRows = document.querySelectorAll('#control_parameters tbody tr');
    const optimisation_parameters = extract_optimisation_parameters(optparamTableRows);

    return optimisation_parameters;
}

// Function extract_optimisation_parameters ----------------------------------------------------------
function extract_optimisation_parameters(rows) {
    const tableData = {};

    rows.forEach(row => {
        // Extract cells in the row
        const cells = row.querySelectorAll('td');

        // Extract parameter name
        const parameterKey = cells[0].querySelector('div').id.replace('_opt_parameters', '');

        // Extract values from input fields
        const initialValue = parseFloat(cells[1].querySelector('input').value);
        const lowerBound = parseFloat(cells[2].querySelector('input').value);
        const upperBound = parseFloat(cells[3].querySelector('input').value);

        // Add data to the dictionary
        tableData[parameterKey] = {
            initial_value: initialValue,
            lower_bound: lowerBound,
            upper_bound: upperBound
        };
    });

    return tableData;
}

// Function load_table_data ----------------------------------------------------------
function load_table_data(tableId, data) {
    const table = document.getElementById(tableId);
    const key_to_label = {
        'A_cell': "Cell surface area [m^2]",
        'Faraday_const': "Faraday constant [(s*A)/mol]",
        'P_0_H2O': "Initial H2O pressure [bar]",
        'P_anode': "Anode Pressure [bar]",
        'P_cathode': "Cathode Pressure [bar]",
        'T_cell': 'Cell temperature [K]',
        'capacity': "Capacity [MW]",
        'cell_type': "Cell type",
        'eta_Faraday': "Faraday's efficiency [-]",
        'initial_mass': "Initial mass content [kg H2]",
        'storage_capacity': "Maximum capacity [kg H2]",
        'hot_temperature_desired': "Desired temperature [deg Celsius]",
        'hot_temperature_return': "Return temperature [deg Celsius]",
        'cold_temperature_available': "Cold temperature [deg Celsius]",
        'cold_deltaT': "Temperature delta [deg Celsius]",
        'hot_mass_flowrate': "Water flow rate [kg/hour]",
    }
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

            // Create an output field for the key
            const keyOutput = document.createElement('output');
            keyOutput.className = 'form-control';
            keyOutput.id = `${key}_key`;
            keyOutput.textContent = key_to_label[key]; // Set the value to the key

            // Create an input field for the value
            const valueInput = document.createElement('input');
            valueInput.type = 'text';
            valueInput.className = 'form-control';
            valueInput.id = `${key}_value`;
            valueInput.value = data[key]; // Set the input field value to the value

            // Append inputs to respective cells
            keyCell.appendChild(keyOutput);
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

// Function clearTableParameter ----------------------------------------------------------
function clearTableParameter() {
    tablename_list = [
        '#electrolyser_parameters',
        '#hydrogen_storage_parameters',
        '#input_profiles',
        '#control_profiles'
    ]

    for (var i = 0; i < tablename_list.length; i++) {
        $(tablename_list[i]).DataTable().columns.adjust().clear()
        $(tablename_list[i]).DataTable().columns.adjust().draw()
    }

}