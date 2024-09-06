function addElectrolyzer() {
    componentStyling = {
        ".label": {
            text: "Electrolyzer",
            fontSize: 12
        },
    };
    inports = ["in"]
    outports = ["out"]
    parameters = {
        type: 'electrolyzer'
    }
    tagnames = {
        "measured": {
        },
        "calculated": {
        }
    }
    addComponent(componentStyling, inports, outports, parameters, tagnames);
}

function addComponent(styling, inports, outports, parameters, tagnames) {
    element = new joint.shapes.devs.Model({
        position: { x: 100, y: 100 },
        size: { width: 100, height: 50 },
        inPorts: inports,
        outPorts: outports,
        attrs: styling,
        parameters: parameters,
        tagnames: tagnames,
        ports: {
            groups: {
                in: {
                    attrs: {
                        ".port-body": {
                            fill: "#000000",
                            r: 5,
                        },
                    },
                },
                out: {
                    attrs: {
                        ".port-body": {
                            fill: "#000000",
                            r: 5,
                        },
                    },
                },
            },
        },
    });

    element.addTo(graph);
}

function addNode() {


    var portsIn = {
        position: {
            name: 'left'
        },
        attrs: {
            portBody: {
                magnet: true,
                r: 5,
                fill: "#000000",
            }
        },
        markup: [{
            tagName: 'circle',
            selector: 'portBody'
        }]
    };

    var portsOut = {
        position: {
            name: 'right'
        },
        attrs: {
            portBody: {
                magnet: true,
                r: 5,
                fill: "#000000",
            }
        },
        markup: [{
            tagName: 'circle',
            selector: 'portBody'
        }]
    };


    var model = new joint.shapes.standard.Circle({
        position: { x: 100, y: 100 },
        size: { width: 20, height: 20 },
        ports: {
            groups: {
                'in': portsIn,
                'out': portsOut
            }
        }
    });


    model.addPorts([
        {
            group: 'in',
            attrs: { label: { text: 'in' } }
        },
        {
            group: 'out',
            attrs: { label: { text: 'out' } }
        }
    ]);

    model.addTo(graph);
}



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

    for (let i = 0; i < prop_names.length; i++) {
        document.getElementById(prop_names[i]).value = eval('element.attributes.parameters.' + prop_names[i])
    }

    tag_names = Object.keys(element.attributes.tagnames.measured)
    for (let i = 0; i < tag_names.length; i++) {
        document.getElementById(tag_names[i]).value = eval('element.attributes.tagnames.measured.' + tag_names[i])
    }

}

hide_all_parameter_table()

function hide_all_parameter_table() {


}


function save_parameters() {

    element = selected_cell

    element.attributes.name = document.getElementById("component_name").value


    tag_names = Object.keys(element.attributes.tagnames.measured)
    for (let i = 0; i < tag_names.length; i++) {
        eval('element.attributes.tagnames.measured.' + tag_names[i] + '= document.getElementById("' + tag_names[i] + '").value')
    }

}

