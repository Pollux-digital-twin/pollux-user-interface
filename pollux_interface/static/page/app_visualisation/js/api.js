// ===================================================================================
//                      EVENT LISTENERS / ON-CHANGE actions
// ===================================================================================
// Listener get_results_list when page is loaded ----------------------------------------------------------
document.addEventListener("DOMContentLoaded", function() {
//    Update the dropdown menu with available results
    get_results_list();
});

$('#results_list').on('change', function () {
    load_results(function(results_data) {
        console.log('load_results returned the data:', results_data)
        plot_results(results_data)
    });
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

// Function plot_results ----------------------------------------------------------
function plot_results(results_data) {
    var outputs_dict = results_data.outputs_dict;
    var kpis_dict = results_data.kpis_dict;
    var solver_param = results_data.solver_param;

    result_name = $('#results_list').val();
    project_name = $('#project_name').val();
    mode = $('#mode').val();

    input = {
        "result_name": result_name,
        "project_name": project_name
    }

    control_reshaped = simulation_param['control_reshaped']
    time_vector_control = simulation_param['time_vector_control']

     const plotData = [
            { id: 'control_figure', data: outputs_dict['control_data'], title: 'Control Data' }
            ];
//            { id: 'optimization_figure', data: outputs_dict['optimization_data'], title: 'Optimization Data' },
//            { id: 'power_figure', data: outputs_dict['power_data'], title: 'Power Data' },
//            { id: 'hydrogen_figure', data: outputs_dict['hydrogen_data'], title: 'Hydrogen Data' },
//            { id: 'mismatch_figure', data: outputs_dict['mismatch_data'], title: 'Mismatch Data' },
//            { id: 'kpi_figure', data: kpis_dict['kpi_data'], title: 'KPI Data' },
//            { id: 'storage_figure', data: outputs_dict['storage_data'], title: 'Storage Data' }
//        ];
     // Loop through each figure data and plot
        plotData.forEach(function(figure) {
            const figureElement = document.getElementById(figure.id);
            if (figure.data && figure.data.length > 0) {
                const trace = {
                    x: figure.data.x,  // Assuming x values are in `x` key
                    y: figure.data.y,  // Assuming y values are in `y` key
                    type: 'scatter',   // Type of plot (e.g., scatter, line)
                    mode: 'lines+markers',
                    name: figure.title
                };

                const layout = {
                    title: figure.title,
                    xaxis: { title: 'X-axis Label' },  // Adjust accordingly
                    yaxis: { title: 'Y-axis Label' },  // Adjust accordingly
                    showlegend: true
                };

                // Plot the figure with Plotly
                Plotly.newPlot(figure.id, [trace], layout);
            } else {
                // If no data is available, show a message (optional)
                figureElement.innerHTML = 'No data available';
            }
        });

}
