init_storage()

document.addEventListener('click', function (event) {
    if (event.target.tagName === 'BUTTON') {
        if (event.target.id === 'power_supply_profile_button') {
            document.getElementById('power_supply_profile_csv').click();
        } else if (event.target.id === 'power_demand_profile_button') {
            document.getElementById('power_demand_profile_csv').click();
        } else if (event.target.id === 'hydrogen_demand_profile_button') {
            document.getElementById('hydrogen_demand_profile_csv').click();
        } else if (event.target.id === 'splitter1_profile_button') {
            document.getElementById('splitter1_profile_csv').click();
        } else if (event.target.id === 'splitter2_profile_button') {
            document.getElementById('splitter2_profile_csv').click();
        } else if (event.target.id === 'hydrogen_storage_profile_button') {
            document.getElementById('hydrogen_storage_profile_csv').click();
        }

        if (event.target.id === 'power_supply_profile_plot_button') {
            setTimeout(function(){plotProfiles('power_supply_profile_data')},500);
        } else if (event.target.id === 'power_demand_profile_plot_button') {
            setTimeout(function(){plotProfiles('power_demand_profile_data')},500);
        } else if (event.target.id === 'hydrogen_demand_profile_plot_button') {
            setTimeout(function(){plotProfiles('hydrogen_demand_profile_data')},500);
        } else if (event.target.id === 'splitter1_profile_plot_button') {
            setTimeout(function(){plotProfiles('splitter1_profile_data')},500);
        } else if (event.target.id === 'splitter2_profile_plot_button') {
            setTimeout(function(){plotProfiles('splitter2_profile_data')},500);
        } else if (event.target.id === 'hydrogen_storage_profile_plot_button') {
            setTimeout(function(){plotProfiles('hydrogen_storage_profile_data')},500);
        }
    }
});

$("#myProfileModal").on('show.bs.modal', function () {
    Plotly.purge('profiles_plot')
});


function plotProfiles(profile_name) {

    // Extract data
    storage_json = sessionStorage.getItem('allParsedCSVData');
    storage_dict = JSON.parse(storage_json);

    plotdata = storage_dict[profile_name]
    const time_vector = Object.keys(plotdata);
    const y_values = Object.values(plotdata);

    // Create the trace for the efficiency plot
    const trace1 = {
        x: time_vector,
        y: y_values,
        mode: 'lines',
        line: { shape: 'hv', width: 2 }, // 'hv' for step-like lines, 'red' color
    };

    // Define layout for the plot
    const layout = {
        plot_bgcolor: "#27293D",
        paper_bgcolor: "#27293D",
        font: {
            color: "#D2D2D5"
        },
        title: profile_name,
        xaxis: {
            title: 'Time (hr)'
        },
        yaxis: {
            title: '',
        }
    };

    // Show plot
    Plotly.newPlot('profiles_plot', [trace1], layout);


}

function init_storage() {

    storageKeys = ['power_supply_profile_data', 'power_demand_profile_data', 'hydrogen_demand_profile_data',
        'splitter1_profile_data', 'splitter2_profile_data', 'hydrogen_storage_profile_data']

    initialData = {}
    for (key of storageKeys) {
        initialData[key] = {}
    }

    sessionStorage.setItem('allParsedCSVData', JSON.stringify(initialData))
};


function handleFileSelect(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();

        // Read the file and parse its content
        reader.onload = function (e) {
            const content = e.target.result;
            const parsedData = parseCSV(content);
            

            // Get the button id that triggered the file input
            const buttonId = event.target.id;
            let storageKey = '';

            // Map button ids to specific keys in sessionStorage
            if (buttonId === 'power_supply_profile_csv') {
                storageKey = 'power_supply_profile_data';
            } else if (buttonId === 'power_demand_profile_csv') {
                storageKey = 'power_demand_profile_data';
            } else if (buttonId === 'hydrogen_demand_profile_csv') {
                storageKey = 'hydrogen_demand_profile_data';
            } else if (buttonId === 'splitter1_profile_csv') {
                storageKey = 'splitter1_profile_data';
            } else if (buttonId === 'splitter2_profile_csv') {
                storageKey = 'splitter2_profile_data';
            } else if (buttonId === 'hydrogen_storage_profile_csv') {
                storageKey = 'hydrogen_storage_profile_data';
            }

            // Retrieve existing data from sessionStorage (if any)
            const existingData = JSON.parse(sessionStorage.getItem('allParsedCSVData')) || {};

            // Add the new data for the specific file
            existingData[storageKey] = parsedData

            // Save the updated data back to sessionStorage
            sessionStorage.setItem('allParsedCSVData', JSON.stringify(existingData));
        };

        // Handle file reading errors
        reader.onerror = function (e) {
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



