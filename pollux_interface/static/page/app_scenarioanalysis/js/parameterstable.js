// Function get_table_data ----------------------------------------------------------
function get_table_data() {
    project_case = document.getElementById('project_case').value;

    if (project_case === "Power to Hydrogen") {
        // Retrieve electrolyser parameters
        const electrolyserTableRows = document.querySelectorAll('#electrolyser_parameters tbody tr');
        const electrolyser_parameters = extract_table_data(electrolyserTableRows);

        // Retrieve hydrogen storage parameters
        const hydrogenStorageTableRows = document.querySelectorAll('#hydrogen_storage_parameters tbody tr');
        const hydrogen_storage_parameters = extract_table_data(hydrogenStorageTableRows);

        // Construct the table data object
        table_data = {
            'power_to_hydrogen': {
                'electrolyser_parameters': electrolyser_parameters,
                'hydrogen_storage_parameters': hydrogen_storage_parameters
            }
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
                data[key] = value;
            }
        }
    });
    return data;
}


// Function get_optimization_parameters ----------------------------------------------------------
function get_optimization_parameters() {

    // Retrieve optimization parameters
    const optparamTableRows = document.querySelectorAll('#control_parameters tbody tr');
    const optimization_parameters = extract_optimization_parameters(optparamTableRows);

    return optimization_parameters;
}

// Function extract_optimization_parameters ----------------------------------------------------------
function extract_optimization_parameters(rows) {
    const tableData = {};

    rows.forEach(row => {
        // Extract cells in the row
        const cells = row.querySelectorAll('td');

        // Extract parameter name
        const parameterKey = cells[0].querySelector('div').id.replace('_parameters', '');

        // Extract values from input fields
        const initialValue = parseFloat(cells[1].querySelector('input').value);
        const lowerBound = parseFloat(cells[2].querySelector('input').value);
        const upperBound = parseFloat(cells[3].querySelector('input').value);

        // Add data to the dictionary
        tableData[parameterKey] = {
            initialValue: initialValue,
            lowerBound: lowerBound,
            upperBound: upperBound
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
        'storage_capacity': "Maximum capacity [kg H2]"
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