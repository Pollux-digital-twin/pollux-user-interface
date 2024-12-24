var namespace = joint.shapes;

var graph = new joint.dia.Graph({});

var paper = new joint.dia.Paper({
    el: document.getElementById('mybuilder'),
    model: graph,
    width: window.innerWeight,
    height: 600,
    gridSize: 10,
    drawGrid: true,
    defaultLink: new joint.shapes.devs.Link({
        attrs: {
            ".marker-target": {
                d: "M 10 0 L 0 5 L 10 10 z",
            },
        }
    }),
    snapLinks: { radius: 50 },

});
paper.setInteractivity(false);

// LINE
paper.options.defaultRouter = {
    name: "manhattan",
    args: {
        step: 10,
    },
};

paper.options.defaultConnector = {
    name: "jumpover",
    size: 10
};


// ZOOOM
graphScale = 1;
paper.on('blank:mousewheel', function (evt, x, y, delta) {
    // Prevent zooming, set scale to 1
    graphScale = 1;
    paper.scale(graphScale);
});

paper.on({
    'element:contextmenu': onElementRightClick,
    'blank:contextmenu': onBlankRightClick
});

selected_element = ''
selected_cell = null

function onElementRightClick(view) {
    selected_cell = null
    selected_element = ''
}

function onBlankRightClick(view) {
    selected_cell = null
    selected_element = ''
}
