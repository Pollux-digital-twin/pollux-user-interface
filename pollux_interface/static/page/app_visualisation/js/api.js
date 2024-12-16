// ===================================================================================
//                      EVENT LISTENERS / ON-CHANGE actions
// ===================================================================================
// Listener get_results_list when page is loaded ----------------------------------------------------------
document.addEventListener("DOMContentLoaded", function() {
//    Update the dropdown menu with available results
    get_results_list();
});

$('#results_list').on('change', async function () {
    try {
        const result = await load_results();
        console.log('load_results returned the data: ', result);

        const result_name = $('#results_list').val();
        console.log('result_name = ', result_name);

        // Assuming plot_results is a function that takes the results_data as input
        plot_results(result.results_data, result_name);
    } catch (error) {
        console.error('Error in load_results:', error);
    }
});



// ===================================================================================
//                                  FUNCTIONS
// ===================================================================================
// Function get_results_list ----------------------------------------------------------
function get_results_list() {
    project_name = $('#project_name').val();
    if (project_name == "") {
        return
    }
    $.ajax({
        type: 'POST',
        url: '/app/visualisation/getresultslist',
        contentType: 'application/json',
        data: JSON.stringify({ project_name: project_name }),
        success: function (data) {
            console.log('getresultslist was succesful, returned data = ', data)

            const results_list = data.results_list;

            var fieldselect = document.getElementById('results_list');

            // Clear any existing options
            fieldselect.options.length = 0;

            // Check if there are any results to add
            if (results_list.length === 0) {
                // If no results are available, display the "Select result" message
                var defaultOption = new Option("Select result", "", true, false);
                fieldselect.options[fieldselect.options.length] = defaultOption;
            } else {
                // If there are results, add them to the dropdown
                for (var i = 0; i < results_list.length; i++) {
                    fieldselect.options[fieldselect.options.length] = new Option(results_list[i], results_list[i]);
                }
            }
            // After updating the options, ensure no option is selected
            fieldselect.selectedIndex = -1;
        }
    })
}


// Function plot_results ----------------------------------------------------------
function plot_results(results_data, result_name) {
    const mode = result_name.endsWith('_simulation') ? 'simulation' : result_name.endsWith('_optimisation') ? 'optimisation' : null;

//    Optimisation plots
    if (mode == 'optimisation') {
//        Unhide panels
        const panels = [
            { id: 'objective_func_plot', panel: $('#objective_func_plot') },
            { id: 'scaled_control_plot', panel: $('#scaled_control_plot') }
        ];
        panels.forEach(({ id, panel }) => {
            panel.closest('.panel').show();
        });
//        Create objective function plot
        const obj_func_plot_data = results_data['objective_func_plot']
        obj_func_plot(obj_func_plot_data)
//        Create scaled controls plot
        const scaled_control_plot_data = results_data['scaled_control_plot']
        scaled_control_plot(scaled_control_plot_data)
    } else {
//        Hide panels
        const panels = [
        { id: 'objective_func_plot', panel: $('#objective_func_plot') },
        { id: 'scaled_control_plot', panel: $('#scaled_control_plot') }
    ];
    panels.forEach(({ id, panel }) => {
            panel.closest('.panel').hide();
        });
    }
//    Create control profiles plot
    const control_profiles_plot_data = results_data['control_profiles_plot']
    control_profiles_plot(control_profiles_plot_data)
//    Create power profiles plot
    const power_profiles_plot_data = results_data['power_profiles_plot']
    power_profiles_plot(power_profiles_plot_data)
//    Create hydrogen profiles plot
    const hydrogen_profiles_plot_data = results_data['hydrogen_profiles_plot']
    hydrogen_profiles_plot(hydrogen_profiles_plot_data)
//    Create mismatch plot
    const mismatch_plot_data = results_data['mismatch_plot']
    mismatch_plot(mismatch_plot_data)
//    Create kpi plot
    const kpi_plot_data = results_data['kpi_plot']
    kpi_plot(kpi_plot_data)
//    Create hydrogen storage plot
    const hydrogen_storage_plot_data = results_data['kpi_plot']
    hydrogen_storage_plot(hydrogen_storage_plot_data)

}

// Function load_results ----------------------------------------------------------
function load_results() {
    return new Promise((resolve, reject) => {
        var result_name = $('#results_list').val();
        var project_name = $('#project_name').val();
        var mode = $('#mode').val();

        var input = {
            "result_name": result_name,
            "project_name": project_name,
            "mode": mode
        };

        $.ajax({
            type: 'POST',
            url: '/app/visualisation/loadresults',
            contentType: 'application/json',
            data: JSON.stringify({ input: input }),
            success: function (data) {
                console.log('loadresults was successful, returned data = ', data);

                var results_data = data;

                // Resolve the promise with the dictionaries
                resolve({ results_data });
            },
            error: function (xhr, status, error) {
                reject(error);
            }
        });
    });
}

//OPTIMIZATION PLOTS -------------------------------------------------------------
//Objective function plot
function obj_func_plot(data) {
    // Extract data
    const { function_value, objective_label } = data;

    // Create the trace for the plot
    const trace = {
        x: Array.from({ length: function_value.length }, (_, i) => i + 1), // Iteration (1, 2, 3, ...)
        y: function_value,
        type: 'scatter',
        mode: 'lines',
        line: { color: 'blue' },
        name: 'Objective Value'
    };

    // Define the layout
    const layout = {
        title: 'Objective Function',
        xaxis: {
            title: 'Iteration',
            tickmode: 'linear',
            dtick: 10
        },
        yaxis: {
            title: objective_label,
            gridcolor: 'rgba(200, 200, 200, 0.75)',
            zeroline: false
        },
        grid: {
            y: { visible: true, color: 'rgba(200, 200, 200, 0.75)' }
        },
        margin: {
            l: 50, r: 30, t: 50, b: 50
        },
        plot_bgcolor: 'white',
        showlegend: false
    };

    // Show plot
    Plotly.newPlot('objective_func_plot', [trace], layout);
}

//Scaled controls plot
function scaled_control_plot(data) {
    const time_vector = data.time_vector_control;
    const control_scaled_value = data.control_scaled_value;
    const components_with_control = data.components_with_control;

    const n = time_vector.length - 1;

    // Create traces for each subplot
    const traces = [];

    // Subplot 1: Multiple curves from control_scaled_value[:, :n]
    for (let i = 0; i < control_scaled_value.length; i++) {
        traces.push({
            x: Array.from({ length: n }, (_, j) => j + 1),
            y: control_scaled_value[i].slice(0, n),
            mode: 'lines',
            line: { shape: 'hv', color: `hsl(${i * 30}, 70%, 50%)` }, // Unique color for each curve
            name: `${components_with_control[0]} - Line ${i + 1}`,
            xaxis: 'x1',
            yaxis: 'y1',
        });
    }

    // Subplot 2: Multiple curves from control_scaled_value[:, n:2 * n]
    for (let i = 0; i < control_scaled_value.length; i++) {
        traces.push({
            x: Array.from({ length: n }, (_, j) => j + 1),
            y: control_scaled_value[i].slice(n, 2 * n),
            mode: 'lines',
            line: { shape: 'hv', color: `hsl(${i * 30}, 70%, 50%)` }, // Same color series
            name: `${components_with_control[1]} - Line ${i + 1}`,
            xaxis: 'x2',
            yaxis: 'y2',
        });
    }

    // Subplot 3: Multiple curves from control_scaled_value[:, 2 * n:]
    for (let i = 0; i < control_scaled_value.length; i++) {
        traces.push({
            x: Array.from({ length: n }, (_, j) => j + 1),
            y: control_scaled_value[i].slice(2 * n),
            mode: 'lines',
            line: { shape: 'hv', color: `hsl(${i * 30}, 70%, 50%)` }, // Same color series
            name: `${components_with_control[2]} - Line ${i + 1}`,
            xaxis: 'x3',
            yaxis: 'y3',
        });
    }

    // Layout for the plot
    const layout = {
        title: 'Scaled Control',
        grid: { rows: 3, columns: 1, pattern: 'independent' },
        xaxis: {
            title: 'Iteration',
            tickmode: 'linear',
        },
        xaxis2: {
            title: 'Iteration',
            tickmode: 'linear',
        },
        xaxis3: {
            title: 'Iteration',
            tickmode: 'linear',
        },
        yaxis: { showticklabels: true },
        yaxis2: { showticklabels: true },
        yaxis3: { showticklabels: true },
        legend: {
            orientation: 'h',
            x: 0.5,
            xanchor: 'center',
            y: -0.2,
        },
        height: 800,
    };

    // Show the plot with subplots
    Plotly.newPlot('scaled_control_plot', traces, layout);
}






//SIMULATION AND OPTIMIZATION PLOTS -----------------------------------------------
//Control profiles plot
function control_profiles_plot(data) {
    // Extract data from the input object
    const time_vector_control = data.time_vector_control;
    const control_reshaped = data.control_reshaped;
    const components_with_control = data.components_with_control;

    // Create traces for the left y-axis
    const trace1 = {
        x: time_vector_control,
        y: control_reshaped[0],
        mode: 'lines',
        line: { color: 'red' },
        name: components_with_control[0]
    };

    const trace2 = {
        x: time_vector_control,
        y: control_reshaped[1],
        mode: 'lines',
        line: { color: 'red', dash: 'dash' },
        name: components_with_control[1]
    };

    // Create trace for the right y-axis
    const trace3 = {
        x: time_vector_control,
        y: control_reshaped[2].map(val => val * 3600), // Convert to [kg/hr]
        mode: 'lines',
        line: { color: 'blue' },
        name: 'Hydrogen Storage mass flow out',
        yaxis: 'y2'
    };

    // Define layout with dual y-axes
    const layout = {
        title: 'Control Profiles',
        xaxis: {
            title: 'Time (hr)',
            tickvals: time_vector_control
        },
        yaxis: {
            title: 'Splitter Control [-]',
            titlefont: { color: 'red' },
            tickfont: { color: 'red' }
        },
        yaxis2: {
            title: 'Storage production rate [kg/hr]',
            titlefont: { color: 'blue' },
            tickfont: { color: 'blue' },
            overlaying: 'y',
            side: 'right'
        },
        legend: {
            x: 0,
            y: 1
        },
        grid: { visible: true }
    };

    // Show plot
    const traces = [trace1, trace2, trace3];
    Plotly.newPlot('control_profiles_plot', traces, layout);
}

//Power profiles plot
function power_profiles_plot(data) {
    // Extract the necessary data from the input object
    const time_vector = data.time_vector
    const power_supply = data.power_supply
    const power_delivered = data.power_delivered
    const electrolyser_power_input = data.electrolyser_power_input
    const power_demand = data.power_demand

    // Define the traces for the plot
    const trace1 = {
        x: time_vector,
        y: power_supply,
        mode: 'lines',
        line: { shape: 'hv', color: 'red', width: 2 },
        name: 'Power Supply'
    };

    const trace2 = {
        x: time_vector,
        y: power_delivered,
        mode: 'lines',
        line: { shape: 'hv', color: 'green' },
        name: 'Power Delivered'
    };

    const trace3 = {
        x: time_vector,
        y: electrolyser_power_input,
        mode: 'lines',
        line: { shape: 'hv', color: 'cyan' },
        name: 'Electrolyser Power Input'
    };

    const trace4 = {
        x: time_vector,
        y: power_demand,
        mode: 'lines',
        line: { shape: 'hv', color: 'blue', width: 2 },
        name: 'Power Demand'
    };

    // Combine all traces
    const traces = [trace1, trace2, trace3, trace4];

    // Define the layout
    const layout = {
        title: 'Power Profiles',
        xaxis: {
            title: 'Time (hr)',
        },
        yaxis: {
            title: 'Power [MW]',
        },
        legend: {
            orientation: 'h',
            x: 0.5,
            xanchor: 'center',
            y: -0.2
        },
        grid: { visible: true },
        margin: { t: 50, b: 50, l: 50, r: 50 },
    };

    // Show plot
    Plotly.newPlot('power_profiles_plot', traces, layout);
}

//Hydrogen profiles plot
function hydrogen_profiles_plot(data) {
    // Extract data from the input object
    const time_vector = data.time_vector;
    const hydrogen_electrolyser_to_demand = data.hydrogen_electrolyser_to_demand;
    const hydrogen_electrolyser_to_storage = data.hydrogen_electrolyser_to_storage;
    const hydrogen_storage_mass_flow_out = data.hydrogen_storage_mass_flow_out;
    const hydrogen_demand = data.hydrogen_demand;
    const hydrogen_delivered = data.hydrogen_delivered;

    // Create traces for each hydrogen profile
    const trace1 = {
        x: time_vector,
        y: hydrogen_electrolyser_to_demand,
        mode: 'lines',
        line: {shape: 'hv', color: 'cyan'},
        name: 'Hydrogen from Electrolyser to Demand'
    };

    const trace2 = {
        x: time_vector,
        y: hydrogen_electrolyser_to_storage,
        mode: 'lines',
        line: {shape: 'hv', color: 'magenta'},
        name: 'Hydrogen from Electrolyser to Storage'
    };

    const trace3 = {
        x: time_vector,
        y: hydrogen_storage_mass_flow_out,
        mode: 'lines',
        line: {shape: 'hv', color: 'yellow'},
        name: 'Hydrogen from Storage to Demand'
    };

    const trace4 = {
        x: time_vector,
        y: hydrogen_demand,
        mode: 'lines',
        line: {shape: 'hv', color: 'blue', width: 2},
        name: 'Hydrogen Demand'
    };

    const trace5 = {
        x: time_vector,
        y: hydrogen_delivered,
        mode: 'lines',
        line: {shape: 'hv', color: 'green'},
        name: 'Hydrogen Delivered'
    };

    // Combine all traces
    const traces = [trace1, trace2, trace3, trace4, trace5];

    // Layout configuration
    const layout = {
        title: 'Hydrogen Profiles',
        xaxis: {
            title: 'Time (hr)'
        },
        yaxis: {
            title: 'Hydrogen flow [kg/hr]'
        },
        legend: {
            orientation: 'h',
            x: 0.5,
            xanchor: 'center',
            y: -0.2
        },
        grid: true
    };

    // Show plot
    Plotly.newPlot('hydrogen_profiles_plot', traces, layout);
}

//Mismatch plot
function mismatch_plot(data) {
    // Extract data from the input object
    const time_vector = data.time_vector;
    const power_difference = data.power_difference;
    const hydrogen_difference = data.hydrogen_difference;

    // Define the traces for the two step plots
    const powerTrace = {
        x: time_vector,
        y: power_difference,
        mode: 'lines',
        line: {
            shape: 'hv', // Equivalent to `where='post'` in Matplotlib
            color: 'red'
        },
        name: 'Power',
        yaxis: 'y1'
    };

    const hydrogenTrace = {
        x: time_vector,
        y: hydrogen_difference,
        mode: 'lines',
        line: {
            shape: 'hv',
            color: 'blue'
        },
        name: 'Hydrogen',
        yaxis: 'y2'
    };

    // Define the layout of the plot
    const layout = {
        title: '(Demand - Delivered)/Demand',
        xaxis: {
            title: 'Time (hr)'
        },
        yaxis: {
            title: 'Power [MW]',
            titlefont: { color: 'red' },
            tickfont: { color: 'red' },
            range: [-1, 1]
        },
        yaxis2: {
            title: 'Hydrogen [kg/hr]',
            titlefont: { color: 'blue' },
            tickfont: { color: 'blue' },
            overlaying: 'y',
            side: 'right',
            range: [-1, 1]
        },
        legend: {
            x: 0.5,
            y: -0.2,
            orientation: 'h'
        },
        grid: {
            rows: 1,
            columns: 1,
            pattern: 'independent'
        }
    };

    // Show plot
    const plotData = [powerTrace, hydrogenTrace];
    Plotly.newPlot('mismatch_plot', plotData, layout);
}

//KPI plot
function kpi_plot(data) {
    // Extract data
    const time_vector = data.time_vector;
    const efficiency_electrolyser = data.efficiency_electrolyser;

    // Create the trace for the efficiency plot
    const trace1 = {
        x: time_vector,
        y: efficiency_electrolyser,
        mode: 'lines+markers',
        line: {shape: 'hv', color: 'red'}, // 'hv' for step-like lines, 'red' color
        name: 'Efficiency %'
    };

    // Define layout for the plot
    const layout = {
        title: 'Electrolyser',
        xaxis: {
            title: 'Time (hr)'
        },
        yaxis: {
            title: 'Efficiency [%]',
            titlefont: {color: 'red'},
            tickfont: {color: 'red'}
        },
        legend: {
            x: 1,
            xanchor: 'right',
            y: 1
        },
        grid: {
            rows: 1,
            columns: 1,
            pattern: 'independent'
        },
        showgrid: true
    };

    // Show plot
    Plotly.newPlot('kpi_plot', [trace1], layout);
}

//Hydrogen storage plot
function hydrogen_storage_plot(data) {
    // Extract data from the input object
    const time_vector = data.time_vector;
    const hydrogen_mass_stored = data.hydrogen_mass_stored;
    const fill_level = data.fill_level;
    const hydrogen_storage_mass_flow_in = data.hydrogen_storage_mass_flow_in;
    const hydrogen_storage_mass_flow_out = data.hydrogen_storage_mass_flow_out;

    // Create traces for the plot with step-like lines (use 'hv' shape for 'post' effect)
    const trace1 = {
        x: time_vector,
        y: hydrogen_mass_stored,
        type: 'scatter',
        mode: 'lines',
        line: { color: 'red', shape: 'hv' },
        name: 'Hydrogen Mass Stored',
        xaxis: 'x',
        yaxis: 'y1'
    };

    const trace2 = {
        x: time_vector,
        y: fill_level,
        type: 'scatter',
        mode: 'lines',
        line: { color: 'black', shape: 'hv' },
        name: 'Fill Level %',
        xaxis: 'x',
        yaxis: 'y2'
    };

    const trace3 = {
        x: time_vector,
        y: hydrogen_storage_mass_flow_in,
        type: 'scatter',
        mode: 'lines',
        line: { color: 'blue', shape: 'hv' },
        name: 'Hydrogen Storage Mass Flow In',
        xaxis: 'x',
        yaxis: 'y2'
    };

    const trace4 = {
        x: time_vector,
        y: hydrogen_storage_mass_flow_out,
        type: 'scatter',
        mode: 'lines',
        line: { color: 'green', shape: 'hv' },
        name: 'Hydrogen Storage Mass Flow Out',
        xaxis: 'x',
        yaxis: 'y2'
    };

    // Layout configuration
    const layout = {
        title: 'Hydrogen Storage Profiles',
        xaxis: {
            title: 'Time (hr)',
            tickmode: 'linear',
        },
        yaxis: {
            title: 'Hydrogen Mass Stored [kg]',
            titlefont: { color: 'red' },
            tickfont: { color: 'red' }
        },
        yaxis2: {
            title: 'Fill Level [%] / Hydrogen Mass Flow [kg/hr]',
            titlefont: { color: 'blue' },
            tickfont: { color: 'blue' },
            overlaying: 'y',
            side: 'right'
        },
        legend: {
            x: 0.5,
            y: -0.2,
            xanchor: 'center',
            orientation: 'h',
            bgcolor: 'rgba(255, 255, 255, 0.5)'
        },
        height: 600,
        margin: {
            t: 50,
            b: 50,
            l: 70,
            r: 70
        }
    };

    // Combine traces
    const traces = [trace1, trace2, trace3, trace4];

    // Show the plot
    Plotly.newPlot('hydrogen_storage_plot', traces, layout);
}

