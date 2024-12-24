// ===================================================================================
//                      EVENT LISTENERS / ON-CHANGE actions
// ===================================================================================
// Listener get_results_list when page is loaded ----------------------------------------------------------
document.addEventListener("DOMContentLoaded", function () {
    //    Update the dropdown menu with available results
    get_results_list();
});

$('#results_list').on('change', async function () {
    try {
        result = await load_results();

        result_name = $('#results_list').val();

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
            results_list = data.results_list;

            var fieldselect = document.getElementById('results_list');

            // Clear any existing options
            fieldselect.options.length = 0;


            // If there are results, add them to the dropdown
            for (var i = 0; i < results_list.length; i++) {
                fieldselect.options[fieldselect.options.length] = new Option(results_list[i], results_list[i]);
            }

            // After updating the options, ensure no option is selected
            fieldselect.selectedIndex = -1;
        }
    })
}


// Function plot_results ----------------------------------------------------------
function plot_results(results_data, result_name) {
    mode = result_name.endsWith('_simulation') ? 'simulation' : result_name.endsWith('_optimisation') ? 'optimisation' : null;

    panels = [
        { id: 'objective_func_plot', panel: $('#objective_func_plot') },
        { id: 'scaled_control_plot', panel: $('#scaled_control_plot') },
        { id: 'hydrogen_profiles_plot', panel: $('#hydrogen_profiles_plot') },
        { id: 'heat_profiles_plot', panel: $('#heat_profiles_plot') },
        { id: 'kpi_plot', panel: $('#kpi_plot') },
        { id: 'hydrogen_storage_plot', panel: $('#hydrogen_storage_plot') }
    ];
    panels.forEach(({ id, panel }) => {
        panel.closest('.panel').hide();
    });
    //    Optimisation plots
    if (mode == 'optimisation') {
        //        Unhide panels
        panels = [
            { id: 'objective_func_plot', panel: $('#objective_func_plot') },
            //{ id: 'scaled_control_plot', panel: $('#scaled_control_plot') }
        ];
        panels.forEach(({ id, panel }) => {
            panel.closest('.panel').show();
        });
        //        Create objective function plot
        obj_func_plot_data = results_data['objective_func_plot']
        obj_func_plot(obj_func_plot_data)
        // //        Create scaled controls plot
        //  scaled_control_plot_data = results_data['scaled_control_plot']
        // scaled_control_plot(scaled_control_plot_data)
    }
    //    Create control profiles plot
    control_profiles_plot_data = results_data['control_profiles_plot']
    control_profiles_plot(control_profiles_plot_data, results_data["project_case"])
    //    Create power profiles plot
    power_profiles_plot_data = results_data['power_profiles_plot']
    power_profiles_plot(power_profiles_plot_data, results_data["project_case"])

    //    Create mismatch plot
    mismatch_plot_data = results_data['mismatch_plot']
    mismatch_plot(mismatch_plot_data, results_data["project_case"])

    if (results_data["project_case"] == "power_to_hydrogen") {
        //        Unhide panels
        panels = [
            { id: 'hydrogen_profiles_plot', panel: $('#hydrogen_profiles_plot') },
            { id: 'hydrogen_storage_plot', panel: $('#hydrogen_storage_plot') },
            { id: 'kpi_plot', panel: $('#kpi_plot') }
        ];
        panels.forEach(({ id, panel }) => {
            panel.closest('.panel').show();
        });
        //    Create kpi plot
        kpi_plot_data = results_data['kpi_plot']
        kpi_plot(kpi_plot_data)
        //    Create hydrogen profiles plot
        hydrogen_profiles_plot_data = results_data['hydrogen_profiles_plot']
        hydrogen_profiles_plot(hydrogen_profiles_plot_data)

        //    Create hydrogen storage plot
        hydrogen_storage_plot_data = results_data['hydrogen_storage_plot']
        hydrogen_storage_plot(hydrogen_storage_plot_data)
    } else if (results_data["project_case"] == "power_to_heat") {
        //        Unhide panels
        panels = [
            { id: 'heat_profiles_plot', panel: $('#heat_profiles_plot') }
        ];
        panels.forEach(({ id, panel }) => {
            panel.closest('.panel').show();
        });
        //    Create heat profiles plot
        heat_profiles_plot_data = results_data['heat_profiles_plot']
        heat_profiles_plot(heat_profiles_plot_data)

    }

}

// Function load_results ----------------------------------------------------------
function load_results() {
    return new Promise((resolve, reject) => {
        var result_name = $('#results_list').val();
        var project_name = $('#project_name').val();
        var project_case = $('#project_case').val();
        var mode = $('#mode').val();

        var input = {
            "result_name": result_name,
            "project_name": project_name,
            "mode": mode,
            "project_case": project_case
        };

        $.ajax({
            type: 'POST',
            url: '/app/visualisation/loadresults',
            contentType: 'application/json',
            data: JSON.stringify({ input: input }),
            success: function (data) {
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
    trace = {
        x: Array.from({ length: function_value.length }, (_, i) => i + 1), // Iteration (1, 2, 3, ...)
        y: function_value,
        mode: 'lines',
        name: 'Objective Value'
    };

    // Define the layout
    layout = {
        plot_bgcolor: "#27293D",
        paper_bgcolor: "#27293D",
        font: {
            color: "#D2D2D5"

        },
        title: 'Objective Function',
        xaxis: {
            title: 'Iteration',
        },
        yaxis: {
            title: objective_label
        },
        grid: { visible: true },
        showlegend: false
    };

    // Show plot
    Plotly.newPlot('objective_func_plot', [trace], layout);
}

//Scaled controls plot
function scaled_control_plot(data) {
    time_vector = data.time_vector_control;
    control_scaled_value = data.control_scaled_value;
    components_with_control = data.components_with_control;

    n = time_vector.length - 1;

    // Create traces for each subplot
    traces = [];

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
    layout = {
        plot_bgcolor: "#27293D",
        paper_bgcolor: "#27293D",
        font: {
            color: "#D2D2D5"

        },
        title: 'Scaled Control',
        grid: { rows: 3, columns: 1, pattern: 'independent' },
        xaxis: {
            title: 'Iteration',
        },
        xaxis2: {
            title: 'Iteration',
        },
        xaxis3: {
            title: 'Iteration',
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
function control_profiles_plot(data, project_case) {
    // Extract data from the input object
    time_vector_control = data.time_vector_control;
    control_reshaped = data.control_reshaped;
    components_with_control = data.components_with_control;

    if (project_case == "power_to_heat") {
        trace1 = {
            x: time_vector_control,
            y: control_reshaped[0],
            mode: 'lines',
            line: { shape: 'hv', width: 2 },
            name: 'splitter electricity demand/heatpump'
        };


        // Define layout with dual y-axes
        layout = {
            plot_bgcolor: "#27293D",
            paper_bgcolor: "#27293D",
            font: {
                color: "#D2D2D5"

            },
            title: 'Control Profiles',
            xaxis: {
                title: 'Time (hr)',
            },
            yaxis: {
                title: 'Splitter Control [-]'
            },
            legend: {
                orientation: 'h',
                x: 0.5,
                xanchor: 'center',
                y: -0.2
            },
            grid: { visible: true }
        };

        traces = [trace1];

    } else if (project_case == "power_to_hydrogen") {
        // Create traces for the left y-axis
        trace1 = {
            x: time_vector_control,
            y: control_reshaped[0],
            mode: 'lines',
            line: { shape: 'hv', width: 2 },
            name: 'splitter electricity demand/electrolyzer'
        };

        trace2 = {
            x: time_vector_control,
            y: control_reshaped[1],
            mode: 'lines',
            line: { shape: 'hv', width: 2 },
            name: 'splitter hydrogen demand/storage'
        };

        // Create trace for the right y-axis
        trace3 = {
            x: time_vector_control,
            y: control_reshaped[2].map(val => val * 3600), // Convert to [kg/hr]
            mode: 'lines',
            line: { shape: 'hv', width: 2 },
            name: 'hydrogen storage mass flow out',
            yaxis: 'y2'
        };

        // Define layout with dual y-axes
        layout = {
            plot_bgcolor: "#27293D",
            paper_bgcolor: "#27293D",
            font: {
                color: "#D2D2D5"

            },
            title: 'Control Profiles',
            xaxis: {
                title: 'Time (hr)',
            },
            yaxis: {
                title: 'Splitter Control [-]'
            },
            yaxis2: {
                title: 'Storage production rate [kg/hr]',
                overlaying: 'y',
                side: 'right'
            },
            legend: {
                orientation: 'h',
                x: 0.5,
                xanchor: 'center',
                y: -0.2
            },
            grid: { visible: true }
        };

        traces = [trace1, trace2, trace3];
    }

    // Show plot

    Plotly.newPlot('control_profiles_plot', traces, layout);
}

//Power profiles plot
function power_profiles_plot(data, project_case) {
    // Extract the necessary data from the input object
    time_vector = data.time_vector
    power_supply = data.power_supply
    power_delivered = data.power_delivered
    power_demand = data.power_demand
    if (project_case == "power_to_hydrogen") {
        electrolyser_power_input = data.electrolyser_power_input
    } else if (project_case == "power_to_heat") {
        heatpump_power_input = data.heatpump_power_input
    }
    // Define the traces for the plot
    trace1 = {
        x: time_vector,
        y: power_supply,
        mode: 'lines',
        line: { shape: 'hv', width: 2 },
        name: 'Electricity Supply'
    };

    trace2 = {
        x: time_vector,
        y: power_delivered,
        mode: 'lines',
        line: { shape: 'hv', width: 2 },
        name: 'Electricity Delivered'
    };

    if (project_case == "power_to_hydrogen") {

        trace3 = {
            x: time_vector,
            y: electrolyser_power_input,
            mode: 'lines',
            line: { shape: 'hv', width: 2 },
            name: 'Electrolyser Electricity Input'
        };
    } else if (project_case == "power_to_heat") {
        trace3 = {
            x: time_vector,
            y: heatpump_power_input,
            mode: 'lines',
            line: { shape: 'hv', width: 2 },
            name: 'heatpump Electricity Input'
        };

    }

    trace4 = {
        x: time_vector,
        y: power_demand,
        mode: 'lines',
        line: { shape: 'hv', width: 2 },
        name: 'Electricity Demand'
    };

    // Combine all traces
    traces = [trace1, trace2, trace3, trace4];

    // Define the layout
    layout = {
        plot_bgcolor: "#27293D",
        paper_bgcolor: "#27293D",
        font: {
            color: "#D2D2D5"

        },
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
    };

    // Show plot
    Plotly.newPlot('power_profiles_plot', traces, layout);
}

//Hydrogen profiles plot
function hydrogen_profiles_plot(data) {
    // Extract data from the input object
    time_vector = data.time_vector;
    hydrogen_electrolyser_to_demand = data.hydrogen_electrolyser_to_demand;
    hydrogen_electrolyser_to_storage = data.hydrogen_electrolyser_to_storage;
    hydrogen_storage_mass_flow_out = data.hydrogen_storage_mass_flow_out;
    hydrogen_demand = data.hydrogen_demand;
    hydrogen_delivered = data.hydrogen_delivered;

    // Create traces for each hydrogen profile
    trace1 = {
        x: time_vector,
        y: hydrogen_electrolyser_to_demand,
        mode: 'lines',
        line: { shape: 'hv', width: 2 },
        name: 'Hydrogen from Electrolyser to Demand'
    };

    trace2 = {
        x: time_vector,
        y: hydrogen_electrolyser_to_storage,
        mode: 'lines',
        line: { shape: 'hv', width: 2 },
        name: 'Hydrogen from Electrolyser to Storage'
    };

    trace3 = {
        x: time_vector,
        y: hydrogen_storage_mass_flow_out,
        mode: 'lines',
        line: { shape: 'hv', width: 2 },
        name: 'Hydrogen from Storage to Demand'
    };

    trace4 = {
        x: time_vector,
        y: hydrogen_demand,
        mode: 'lines',
        line: { shape: 'hv', width: 2 },
        name: 'Hydrogen Demand'
    };

    trace5 = {
        x: time_vector,
        y: hydrogen_delivered,
        mode: 'lines',
        line: { shape: 'hv', width: 2 },
        name: 'Hydrogen Delivered'
    };

    // Combine all traces
    traces = [trace1, trace2, trace3, trace4, trace5];

    // Layout configuration
    layout = {
        plot_bgcolor: "#27293D",
        paper_bgcolor: "#27293D",
        font: {
            color: "#D2D2D5"

        },
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
        grid: { visible: true },
    };

    // Show plot
    Plotly.newPlot('hydrogen_profiles_plot', traces, layout);
}

// heat profiles plot
function heat_profiles_plot(data) {
    // Extract data from the input object
    time_vector = data.time_vector;
    heat_demand = data.heat_demand;
    heat_delivered = data.heat_delivered;

    // Create traces for each heat profile

    trace1 = {
        x: time_vector,
        y: heat_demand,
        mode: 'lines',
        line: { shape: 'hv', width: 2 },
        name: 'Heat Demand'
    };

    trace2 = {
        x: time_vector,
        y: heat_delivered,
        mode: 'lines',
        line: { shape: 'hv', width: 2 },
        name: 'Heat Delivered'
    };

    // Combine all traces
    traces = [trace1, trace2];

    // Layout configuration
    layout = {
        plot_bgcolor: "#27293D",
        paper_bgcolor: "#27293D",
        font: {
            color: "#D2D2D5"

        },
        title: 'Heat Profiles',
        xaxis: {
            title: 'Time (hr)'
        },
        yaxis: {
            title: 'Heat flow [MW]'
        },
        legend: {
            orientation: 'h',
            x: 0.5,
            xanchor: 'center',
            y: -0.2
        },
        grid: { visible: true },
    };

    // Show plot
    Plotly.newPlot('heat_profiles_plot', traces, layout);
}

//Mismatch plot
function mismatch_plot(data, project_case) {
    // Extract data from the input object
    time_vector = data.time_vector;
    power_difference = data.power_difference;

    if (project_case == "power_to_hydrogen") {
        hydrogen_difference = data.hydrogen_difference;
    } else if (project_case == "power_to_heat") {
        heat_difference = data.heat_difference;
    }

    // Define the traces for the two step plots
    powerTrace = {
        x: time_vector,
        y: power_difference,
        mode: 'lines',
        line: {
            shape: 'hv', // Equivalent to `where='post'` in Matplotlib
            width: 2
        },
        name: 'Power',
        yaxis: 'y1'
    };
    if (project_case == "power_to_hydrogen") {
        hydrogenTrace = {
            x: time_vector,
            y: hydrogen_difference,
            mode: 'lines',
            line: {
                shape: 'hv',
                width: 2
            },
            name: 'Hydrogen',
            yaxis: 'y2'
        };

        // Define the layout of the plot
        layout = {
            plot_bgcolor: "#27293D",
            paper_bgcolor: "#27293D",
            font: {
                color: "#D2D2D5"

            },
            title: 'Relative Error (Demand - Delivered)/Demand',
            xaxis: {
                title: 'Time (hr)'
            },
            yaxis: {
                title: 'Power [frac]',
                range: [-1, 1]
            },
            yaxis2: {
                title: 'Hydrogen [frac]',
                overlaying: 'y',
                side: 'right',
                range: [-1, 1]
            },
            legend: {
                orientation: 'h',
                x: 0.5,
                xanchor: 'center',
                y: -0.2
            },
            grid: { visible: true },
        };

        plotData = [powerTrace, hydrogenTrace];
    } else if (project_case == "power_to_heat") {
        heatTrace = {
            x: time_vector,
            y: heat_difference,
            mode: 'lines',
            line: {
                shape: 'hv',
                width: 2
            },
            name: 'Heat',
            yaxis: 'y2'
        };

        // Define the layout of the plot
        layout = {
            plot_bgcolor: "#27293D",
            paper_bgcolor: "#27293D",
            font: {
                color: "#D2D2D5"

            },
            title: 'Relative Error (Demand - Delivered)/Demand',
            xaxis: {
                title: 'Time (hr)'
            },
            yaxis: {
                title: 'Power [frac]',
                range: [-1, 1]
            },
            yaxis2: {
                title: 'Heat [frac]',
                overlaying: 'y',
                side: 'right',
                range: [-1, 1]
            },
            legend: {
                orientation: 'h',
                x: 0.5,
                xanchor: 'center',
                y: -0.2
            },
            grid: { visible: true },
        };

        plotData = [powerTrace, heatTrace];
    }

    Plotly.newPlot('mismatch_plot', plotData, layout);
}

//KPI plot
function kpi_plot(data) {
    // Extract data
    time_vector = data.time_vector;
    efficiency_electrolyser = data.efficiency_electrolyser;

    // Create the trace for the efficiency plot
    trace1 = {
        x: time_vector,
        y: efficiency_electrolyser,
        mode: 'lines',
        line: { shape: 'hv', width: 2 }, // 'hv' for step-like lines, 'red' color
        name: 'Efficiency %'
    };

    // Define layout for the plot
    layout = {
        plot_bgcolor: "#27293D",
        paper_bgcolor: "#27293D",
        font: {
            color: "#D2D2D5"

        },
        title: 'Electrolyser',
        xaxis: {
            title: 'Time (hr)'
        },
        yaxis: {
            title: 'Efficiency [%]',
        },
        legend: {
            orientation: 'h',
            x: 0.5,
            xanchor: 'center',
            y: -0.2
        },
        grid: { visible: true },
    };

    // Show plot
    Plotly.newPlot('kpi_plot', [trace1], layout);
}

//Hydrogen storage plot
function hydrogen_storage_plot(data) {
    // Extract data from the input object
    time_vector = data.time_vector;
    hydrogen_mass_stored = data.hydrogen_mass_stored;
    fill_level = data.fill_level;
    hydrogen_storage_mass_flow_in = data.hydrogen_storage_mass_flow_in;
    hydrogen_storage_mass_flow_out = data.hydrogen_storage_mass_flow_out;

    // Create traces for the plot with step-like lines (use 'hv' shape for 'post' effect)
    trace1 = {
        x: time_vector,
        y: hydrogen_mass_stored,
        mode: 'lines',
        line: { shape: 'hv', width: 2 },
        name: 'Hydrogen Mass Stored',
        xaxis: 'x',
        yaxis: 'y1'
    };

    trace2 = {
        x: time_vector,
        y: fill_level,
        mode: 'lines',
        line: { shape: 'hv', width: 2 },
        name: 'Fill Level %',
        xaxis: 'x',
        yaxis: 'y2'
    };

    trace3 = {
        x: time_vector,
        y: hydrogen_storage_mass_flow_in,
        mode: 'lines',
        line: { shape: 'hv', width: 2 },
        name: 'Hydrogen Storage Mass Flow In',
        xaxis: 'x',
        yaxis: 'y2'
    };

    trace4 = {
        x: time_vector,
        y: hydrogen_storage_mass_flow_out,
        mode: 'lines',
        line: { shape: 'hv', width: 2 },
        name: 'Hydrogen Storage Mass Flow Out',
        xaxis: 'x',
        yaxis: 'y2'
    };

    // Layout configuration
    layout = {
        plot_bgcolor: "#27293D",
        paper_bgcolor: "#27293D",
        font: {
            color: "#D2D2D5"

        },
        title: 'Hydrogen Storage Profiles',
        xaxis: {
            title: 'Time (hr)',
        },
        yaxis: {
            title: 'Hydrogen Mass Stored [kg]',
        },
        yaxis2: {
            title: 'Fill Level [%] / Hydrogen Mass Flow [kg/hr]',
            overlaying: 'y',
            side: 'right'
        },
        legend: {
            orientation: 'h',
            x: 0.5,
            xanchor: 'center',
            y: -0.2
        },
        grid: { visible: true },
    };

    // Combine traces
    traces = [trace1, trace2, trace3, trace4];

    // Show the plot
    Plotly.newPlot('hydrogen_storage_plot', traces, layout);
}

