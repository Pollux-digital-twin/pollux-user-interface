// Clear the previous data when the page loads
//localStorage.removeItem('allParsedCSVData');

//Evenet listener for the dropdown menu
//document.addEventListener('change', function(event) {
//    if (event.target.tagName === 'SELECT' && event.target.value === 'load_csv') {
//        // Trigger file input click based on selected dropdown
//        if (event.target.id === 'power_supply_profile') {
//            document.getElementById('power_supply_profile_csv').click();
//        } else if (event.target.id === 'power_demand_profile') {
//            document.getElementById('power_demand_profile_csv').click();
//        } else if (event.target.id === 'hydrogen_demand_profile') {
//            document.getElementById('hydrogen_demand_profile_csv').click();
//        } else if (event.target.id === 'splitter1_profile') {
//            document.getElementById('splitter1_control_profile_csv').click();
//        } else if (event.target.id === 'splitter2_profile') {
//            document.getElementById('splitter2_control_profile_csv').click();
//        } else if (event.target.id === 'hydrogen_storage_profile') {
//            document.getElementById('hydrogen_storage_profile_csv').click();
//        }
//    }
//});
document.addEventListener('click', function(event) {
    if (event.target.tagName === 'BUTTON') {
        if (event.target.id === 'power_supply_profile_button') {
            document.getElementById('power_supply_profile_csv').click();
        } else if (event.target.id === 'power_demand_profile_button') {
            document.getElementById('power_demand_profile_csv').click();
        } else if (event.target.id === 'hydrogen_demand_profile_button') {
            document.getElementById('hydrogen_demand_profile_csv').click();
        } else if (event.target.id === 'splitter1_control_profile_button') {
            document.getElementById('splitter1_control_profile_csv').click();
        } else if (event.target.id === 'splitter2_control_profile_button') {
            document.getElementById('splitter2_control_profile_csv').click();
        } else if (event.target.id === 'hydrogen_storage_profile_button') {
            document.getElementById('hydrogen_storage_profile_csv').click();
        }
    }
});


function handleFileSelect(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();

        // Read the file and parse its content
        reader.onload = function(e) {
            const content = e.target.result;
            const parsedData = parseCSV(content);
            console.log(`Parsed data from ${file.name}:`, parsedData);

            // Get the button id that triggered the file input
            const buttonId = event.target.id;
            let storageKey = '';

            // Map button ids to specific keys in localStorage
            if (buttonId === 'power_supply_profile_csv') {
                storageKey = 'power_supply_profile_data';
            } else if (buttonId === 'power_demand_profile_csv') {
                storageKey = 'power_demand_profile_data';
            } else if (buttonId === 'hydrogen_demand_profile_csv') {
                storageKey = 'hydrogen_demand_profile_data';
            } else if (buttonId === 'splitter1_control_profile_csv') {
                storageKey = 'splitter1_control_profile_data';
            } else if (buttonId === 'splitter2_control_profile_csv') {
                storageKey = 'splitter2_control_profile_data';
            } else if (buttonId === 'hydrogen_storage_profile_csv') {
                storageKey = 'hydrogen_storage_profile_data';
            }

            // Retrieve existing data from localStorage (if any)
            const existingData = JSON.parse(localStorage.getItem('allParsedCSVData')) || {};

            // Add the new data for the specific file
            existingData[storageKey] = {
                fileName: file.name,
                data: parsedData
            };

            // Save the updated data back to localStorage
            localStorage.setItem('allParsedCSVData', JSON.stringify(existingData));
        };

        // Handle file reading errors
        reader.onerror = function(e) {
            console.error(`Error reading file ${file.name}:`, e);
        };

        reader.readAsText(file);
    }
}



function parseCSV(content) {
    const rows = content.split('\n').filter(row => row.trim() !== '');
    const data = rows.slice(1).reduce((acc, row, index) => {
        const values = row.split(',').map(value => {
            const trimmedValue = value.trim();
            const floatValue = parseFloat(trimmedValue);
            return isNaN(floatValue) ? trimmedValue : floatValue;
        });

        // Store the data in a dictionary with the index as the key (as a string)
        acc[String(index)] = values[1]; // Assuming the second column is the value
        return acc;
    }, {});

    return data;
}



