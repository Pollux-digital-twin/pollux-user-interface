function open_element_parameter(element) {
    hide_all_parameter_table()

    document.getElementById("component_type").value = element.attributes.parameters.type
    document.getElementById("component_id").value = element.id
    if (element.attributes.parameters.name == undefined) {
        document.getElementById("component_name").value = element.attributes.parameters.type + '_' + element.id.substr(0, 4)
        element.attributes.parameters.name = document.getElementById("component_name").value
    } else {
        document.getElementById("component_name").value = element.attributes.parameters.name
    }


    prop_names = []
    //    For each component define a list of parameters
    //EXAMPLE
    //    if (element.attributes.parameters.type == 'esp') {
    //        document.getElementById("table-tagnames-measured-esp").style.display = "block"
    //        document.getElementById("table-component-properties-esp").style.display = "block"
    //
    //        prop_names = ['esp_type', 'esp_no_stage', 'esp_tubing', 'esp_depth', 'esp_min_flow', 'esp_max_flow', 'esp_bep_flow', 'esp_power_coeff', 'esp_head_coeff']
    //    }

//    Electrolyser
    if (element.attributes.parameters.type == 'electrolyser') {
        document.getElementById("table-tagnames-measured-electrolyser").style.display = "block"
        document.getElementById("table-component-properties-electrolyser").style.display = "block"

        prop_names = ['electrolyser_cell_temp', 'electrolyser_cathode_pres', 'electrolyser_anode_pres',
            'electrolyser_init_h2o_pres', 'electrolyser_Far_eff', 'electrolyser_Far_const', 'electrolyser_cell_surface',
            'electrolyser_cell_type', 'electrolyser_capacity_MW'
        ]
    }
//    HYDROGEN DEMAND
    if (element.attributes.parameters.type == 'hydrogen_demand') {
        document.getElementById("table-tagnames-measured-hydrogen_demand").style.display = "block"
        document.getElementById("table-component-properties-hydrogen_demand").style.display = "block"

        prop_names = []
    }
//    HYDROGEN STORAGE
    if (element.attributes.parameters.type == 'hydrogen_storage') {
        document.getElementById("table-tagnames-measured-hydrogen_storage").style.display = "block"
        document.getElementById("table-component-properties-hydrogen_storage").style.display = "block"

        prop_names = ["hydrogen_storage_capacity", "hydrogen_storage_initial_mass"]
    }
//    ELECTRICITY SOURCE
    if (element.attributes.parameters.type == 'electricity_source') {
        document.getElementById("table-tagnames-measured-electricity_source").style.display = "block"
        document.getElementById("table-component-properties-electricity_source").style.display = "block"

        prop_names = []
    }
//    ELECTRICITY DEMAND
    if (element.attributes.parameters.type == 'electricity_demand') {
        document.getElementById("table-tagnames-measured-electricity_demand").style.display = "block"
        document.getElementById("table-component-properties-electricity_demand").style.display = "block"

        prop_names = []
    }
//    ELECTRICITY BATTERY
    if (element.attributes.parameters.type == 'electricity_storage') {
        document.getElementById("table-tagnames-measured-electricity_storage").style.display = "block"
        document.getElementById("table-component-properties-electricity_storage").style.display = "block"

        prop_names = ["electricity_storage_capacity", "electricity_storage_initial_charge"]
    }
//    HEAT SOURCE
    if (element.attributes.parameters.type == 'heat_source') {
        document.getElementById("table-tagnames-measured-heat_source").style.display = "block"
        document.getElementById("table-component-properties-heat_source").style.display = "block"

        prop_names = []
    }
//    HEAT DEMAND
    if (element.attributes.parameters.type == 'heat_demand') {
        document.getElementById("table-tagnames-measured-heat_demand").style.display = "block"
        document.getElementById("table-component-properties-heat_demand").style.display = "block"

        prop_names = []
    }
//    HEAT STORAGE
    if (element.attributes.parameters.type == 'heat_storage') {
        document.getElementById("table-tagnames-measured-heat_storage").style.display = "block"
        document.getElementById("table-component-properties-heat_storage").style.display = "block"

        prop_names = ["heat_storage_capacity", "heat_storage_initial_charge"]
    }
//    HEAT PUMP
    if (element.attributes.parameters.type == 'heat_pump') {
        document.getElementById("table-tagnames-measured-heat_pump").style.display = "block"
        document.getElementById("table-component-properties-heat_pump").style.display = "block"

        prop_names = []
    }
//    NODE
    if (element.attributes.parameters.type == 'node') {
        document.getElementById("table-tagnames-measured-node").style.display = "block"
        document.getElementById("table-component-properties-node").style.display = "block"

        prop_names = ["node_initial_guess", "node_lower_bound", "node_upper_bound"]
    }

    //    Assign properties to properties tab
    for (let i = 0; i < prop_names.length; i++) {
        document.getElementById(prop_names[i]).value = eval('element.attributes.parameters.' + prop_names[i])
    }

    //    Measured tag names are retrieved from the element's attributes
    tag_names = Object.keys(element.attributes.tagnames.measured)
    //    Assign tagnames to tagnames tab
    for (let i = 0; i < tag_names.length; i++) {
        document.getElementById(tag_names[i]).value = eval('element.attributes.tagnames.measured.' + tag_names[i])
    }

}

hide_all_parameter_table()

function hide_all_parameter_table() {
    //    HIDE TAGNAMES TABLES
    document.getElementById("table-tagnames-measured-electrolyser").style.display = "none"
    document.getElementById("table-tagnames-measured-hydrogen_demand").style.display = "none"
    document.getElementById("table-tagnames-measured-hydrogen_storage").style.display = "none"
    document.getElementById("table-tagnames-measured-electricity_source").style.display = "none"
    document.getElementById("table-tagnames-measured-electricity_demand").style.display = "none"
    document.getElementById("table-tagnames-measured-electricity_storage").style.display = "none"
    document.getElementById("table-tagnames-measured-heat_source").style.display = "none"
    document.getElementById("table-tagnames-measured-heat_demand").style.display = "none"
    document.getElementById("table-tagnames-measured-heat_storage").style.display = "none"
    document.getElementById("table-tagnames-measured-heat_pump").style.display = "none"
    document.getElementById("table-tagnames-measured-node").style.display = "none"
//    HIDE PROPERTIES TABLES
    document.getElementById("table-component-properties-electrolyser").style.display = "none"
    document.getElementById("table-component-properties-hydrogen_demand").style.display = "none"
    document.getElementById("table-component-properties-hydrogen_storage").style.display = "none"
    document.getElementById("table-component-properties-electricity_source").style.display = "none"
    document.getElementById("table-component-properties-electricity_demand").style.display = "none"
    document.getElementById("table-component-properties-electricity_storage").style.display = "none"
    document.getElementById("table-component-properties-heat_source").style.display = "none"
    document.getElementById("table-component-properties-heat_demand").style.display = "none"
    document.getElementById("table-component-properties-heat_storage").style.display = "none"
    document.getElementById("table-component-properties-heat_pump").style.display = "none"
    document.getElementById("table-component-properties-node").style.display = "none"

}


function save_parameters() {

    element = selected_cell

    element.attributes.name = document.getElementById("component_name").value

    if (element.attributes.parameters.type == 'electrolyser') {
        element.attributes.parameters.reservoir_pressure = parseFloat(document.getElementById("electrolyser_cell_temp").value)
        element.attributes.parameters.reservoir_pressure = parseFloat(document.getElementById("electrolyser_cathode_pres").value)
        element.attributes.parameters.reservoir_pressure = parseFloat(document.getElementById("electrolyser_anode_pres").value)
        element.attributes.parameters.reservoir_pressure = parseFloat(document.getElementById("electrolyser_init_h2o_pres").value)
        element.attributes.parameters.reservoir_pressure = parseFloat(document.getElementById("electrolyser_Far_eff").value)
        element.attributes.parameters.reservoir_pressure = parseFloat(document.getElementById("electrolyser_Far_const").value)
        element.attributes.parameters.reservoir_pressure = parseFloat(document.getElementById("electrolyser_cell_surface").value)
        element.attributes.parameters.reservoir_pressure = parseFloat(document.getElementById("electrolyser_cell_type").value)
        element.attributes.parameters.reservoir_pressure = parseFloat(document.getElementById("electrolyser_capacity_MW").value)
    }
    if (element.attributes.parameters.type == 'hydrogen_demand') {
        element.attributes.parameters.reservoir_pressure = parseFloat(document.getElementById("hydrogen_demand_profile").value)
    }
    if (element.attributes.parameters.type == 'hydrogen_storage') {
        element.attributes.parameters.reservoir_pressure = parseFloat(document.getElementById("hydrogen_storage_capacity").value)
        element.attributes.parameters.reservoir_pressure = parseFloat(document.getElementById("hydrogen_storage_initial_mass").value)
    }
    if (element.attributes.parameters.type == 'electricity_source') {
        element.attributes.parameters.reservoir_pressure = parseFloat(document.getElementById("electricity_source_profile").value)
    }
    if (element.attributes.parameters.type == 'electricity_demand') {
        element.attributes.parameters.reservoir_pressure = parseFloat(document.getElementById("electricity_demand_profile").value)
    }
    if (element.attributes.parameters.type == 'electricity_storage') {
        element.attributes.parameters.reservoir_pressure = parseFloat(document.getElementById("electricity_storage_capacity").value)
        element.attributes.parameters.reservoir_pressure = parseFloat(document.getElementById("electricity_storage_initial_charge").value)
    }
    if (element.attributes.parameters.type == 'heat_source') {
        element.attributes.parameters.reservoir_pressure = parseFloat(document.getElementById("heat_source_profile").value)
    }
    if (element.attributes.parameters.type == 'heat_demand') {
        element.attributes.parameters.reservoir_pressure = parseFloat(document.getElementById("heat_demand_profile").value)
    }
    if (element.attributes.parameters.type == 'heat_storage') {
        element.attributes.parameters.reservoir_pressure = parseFloat(document.getElementById("heat_storage_capacity").value)
        element.attributes.parameters.reservoir_pressure = parseFloat(document.getElementById("heat_storage_initial_charge").value)
    }
    if (element.attributes.parameters.type == 'heat_pump') {
        element.attributes.parameters.reservoir_pressure = parseFloat(document.getElementById("heat_pump_capacity").value)
        element.attributes.parameters.reservoir_pressure = parseFloat(document.getElementById("heat_pump_efficiency").value)
    }
    if (element.attributes.parameters.type == 'node') {
        element.attributes.parameters.reservoir_pressure = parseFloat(document.getElementById("node_initial_guess").value)
        element.attributes.parameters.reservoir_pressure = parseFloat(document.getElementById("node_lower_bound").value)
        element.attributes.parameters.reservoir_pressure = parseFloat(document.getElementById("node_upper_bound").value)
        element.attributes.parameters.reservoir_pressure = parseFloat(document.getElementById("control_profile").value)
    }

    tag_names = Object.keys(element.attributes.tagnames.measured)
    for (let i = 0; i < tag_names.length; i++) {
        eval('element.attributes.tagnames.measured.' + tag_names[i] + '= document.getElementById("' + tag_names[i] + '").value')
    }

}