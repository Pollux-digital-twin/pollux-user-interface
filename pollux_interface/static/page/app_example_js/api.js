load_plant()

function load_plant() {

    var fieldID = $('#select_project').val();


    $.ajax({
        type: 'POST',
        url: '/app/example_app/load_plant',
        contentType: 'application/json',
        data: JSON.stringify({ field_name: fieldID }),
        success: function (data) {

//            get_well_list()

        }
    })
}

function calculate() {
    var input_data = 'input_data';
    console.log(input_data);

    $.ajax({
        type: 'POST',
        url: '/app/app_example_routes/calculate',
        contentType: 'application/json',
        data: JSON.stringify({ wellhead_pressure: wellhead_pressure, wellhead_temperature: wellhead_temperature, esp_freq: esp_freq }),
        success: function (data) {

            document.getElementById("result_flow").value = math.round(data.sol_flow * 100) / 100
            document.getElementById("result_bhp").value = math.round(data.sol_pbh * 100) / 100
            document.getElementById("result_esp_head").value = math.round(data.sol_esp_head * 100) / 100
            document.getElementById("result_esp_power").value = math.round(data.sol_esp_power * 100) / 100
            document.getElementById("result_esp_efficiency").value = math.round(data.sol_esp_eff * 100) / 100
            document.getElementById("result_intake_pressure").value = math.round(data.sol_intake_pressure * 100) / 100
            document.getElementById("result_discharge_pressure").value = math.round(data.sol_discharge_pressure * 100) / 100


            trace_pres = {
                x: data.flow,
                y: data.reservoir_pressure,
                name: "reservoir pressure",
            }
            trace_intake_esp = {
                x: data.flow,
                y: data.intake_pressure,
                name: "intake pressure",
            }
            trace_discharge_esp = {
                x: data.flow,
                y: data.discharge_pressure,
                name: "discharge pressure",
            }
            trace_vlp = {
                x: data.flow,
                y: data.bottomhole_pressure_from_well,
                name: "VLP",
            }
            trace_ipr = {
                x: data.flow,
                y: data.bottomhole_pressure_from_reservoir,
                name: "IPR",
            }




            Plotly.newPlot('plotVLPIPR', [trace_pres, trace_intake_esp, trace_discharge_esp, trace_vlp, trace_ipr], layout)
        }
    })
}