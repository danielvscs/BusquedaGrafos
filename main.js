var mode = 0;
var char_codes = 99;
var optionsButtons = document.getElementById("options").children;

var type_search = 0;
let bt_ts = [
    document.getElementById("sea_pro"),
    document.getElementById("sea_anc")
]
bt_ts[0].addEventListener("click", (e)=>{
    type_search = 0;
    bt_ts[0].classList.add("font-semiboldborder");
    bt_ts[0].classList.add("border");
    bt_ts[1].classList.remove("font-semiboldborder");
    bt_ts[1].classList.remove("border");
});
bt_ts[1].addEventListener("click", (e)=>{
    type_search = 1;
    bt_ts[1].classList.add("font-semiboldborder");
    bt_ts[1].classList.add("border");
    bt_ts[0].classList.remove("font-semiboldborder");
    bt_ts[0].classList.remove("border");
});

graph_data = {
    "nodes": [ // list of graph elements to start with
        { // node a
            data: { id: 'a' }
        },
        { // node b
            data: { id: 'b' }
        }],
    "edges": [
        { // edge ab
            data: { id: 'ab', source: 'a', target: 'b' }
        }]
};

var cy = cytoscape({

    container: document.getElementById('cy'), // container to render in

    elements: graph_data,

    style: [ // the stylesheet for the graph
        {
            selector: 'node',
            style: {
                'background-color': '#a21caf',
                'label': 'data(id)'
            }
        },
        {
            selector: 'layout',
            style: {
                'color': '#fff',
                "text-valign": "center",
                "text-halign": "center",
            }
        },
        {
            selector: 'edge',
            style: {
                'width': 3,
                'line-color': '#ccc',
                'curve-style': 'bezier'
            }
        }
    ],

    layout: {
        name: 'grid',
        rows: 1
    },
    wheelSensitivity: 0.3,

});
// the default values of each option are outlined below:
let defaults = {
    canConnect: function (sourceNode, targetNode) {
        // whether an edge can be created between source and target
        return !sourceNode.same(targetNode); // e.g. disallow loops
    },
    edgeParams: function (sourceNode, targetNode) {
        // for edges between the specified source and target
        // return element object to be passed to cy.add() for edge
        return {};
    },
    hoverDelay: 150, // time spent hovering over a target node before it is considered selected
    snap: true, // when enabled, the edge can be drawn by just moving close to a target node (can be confusing on compound graphs)
    snapThreshold: 50, // the target node must be less than or equal to this many pixels away from the cursor/finger
    snapFrequency: 15, // the number of times per second (Hz) that snap checks done (lower is less expensive)
    noEdgeEventsInDraw: true, // set events:no to edges during draws, prevents mouseouts on compounds
    disableBrowserGestures: true // during an edge drawing gesture, disable browser gestures such as two-finger trackpad swipe and pinch-to-zoom
};

let eh = cy.edgehandles(defaults);

function addNode(e) {
    cy.add({
        group: 'nodes',
        data: {
            id: String.fromCharCode(char_codes),
            weight: 75
        },
        renderedPosition: { x: e.offsetX, y: e.offsetY },
    });
    char_codes++;
}

optionsButtons[0].addEventListener("click", (e) => {
    eh.disableDrawMode();
    optionsButtons[mode].classList.remove("button-selected");
    optionsButtons[0].classList.add("button-selected");
    mode = 0;
});
optionsButtons[1].addEventListener("click", (e) => {
    eh.disableDrawMode();
    optionsButtons[mode].classList.remove("button-selected");
    optionsButtons[1].classList.add("button-selected");
    mode = 1;
});
optionsButtons[2].addEventListener("click", (e) => {
    eh.enableDrawMode();
    optionsButtons[mode].classList.remove("button-selected");
    optionsButtons[2].classList.add("button-selected");
    mode = 2;
});
optionsButtons[3].addEventListener("click", (e) => {
    eh.disableDrawMode();
    optionsButtons[mode].classList.remove("button-selected");
    optionsButtons[3].classList.add("button-selected");
    mode = 3;
});


cy.on('tap', 'node', (e)=>{
    if(mode==3){
        cy.remove(e.target);
    }
});
cy.on('tap', 'edge', (e)=>{
    if(mode==3){
        cy.remove(e.target);
    }
});
let graph_container = document.getElementById('cy');
graph_container.addEventListener("click", (e) => {
    if(mode==1){
        addNode(e);
    }
})


document.getElementById("start").addEventListener("click", async (e)=>{
    let all_nodes = cy.nodes();
    let all_edges = cy.edges();

    for(let i = 0; i < all_nodes.length; i++ ){
        let node_ani = all_nodes[i].animation({
            style:{
                'background-color': '#4b5563',
            },
            duration: 1000,
        });
        node_ani.play();
    }    

    for(let i = 0; i < all_edges.length; i++ ){
        let node_ani = all_edges[i].animation({
            style:{
                'line-color': '#374151',
            },
            duration: 1000,
        });
        node_ani.play();
    }

    await sleep(3000);
    if(type_search==0){
        DFS(all_nodes);
    }else{
        BFS(all_nodes);
    }
    
});

async function DFS(gNodes){
    for(let i = 0; i < gNodes.length; i++){
        gNodes[i].data("status", 0);
        gNodes[i].data("parent", null);
        gNodes[i].data("pos", i);
    }

    let t = 0;
    let start_pos = 0;
    let node_input_selected = document.getElementById("input_node_value").value;
    let selectedNode = cy.elements(`node#${node_input_selected}`);
    if(selectedNode){
        start_pos = selectedNode.data("pos");
    }

    let i = start_pos;
    while(true){
        if(gNodes[i].data("status")==0){
            await DFSVisit(gNodes, gNodes[i], t);
        }
        i = i<gNodes.length-1?i+1:0;
        if(i==start_pos){
            break;
        }
    }
    /*
    for(let i = start_pos; i < gNodes.length; i++){
        if(gNodes[i].data("status")==0){
            await DFSVisit(gNodes, gNodes[i], t);
        }
    }*/
}

async function DFSVisit(gNodes, uNode, t){
    t++;    
    uNode.data("td", t);
    uNode.data("status", 1);
    animationNode(uNode, "#a21caf", 150);
    await sleep(1000);
    let nbNodes = uNode.neighborhood().nodes();

    //console.log(nbNodes);
    for(let i = 0; i < nbNodes.length; i++){
        
        if (nbNodes[i].data("status")==0){
            nbNodes[i].data("parent", uNode);
            let brother = uNode.edgesWith(nbNodes[i])
            animationEgde(brother, "#ccc", 100);
            await sleep(500);
            await DFSVisit(gNodes, nbNodes[i], t);
            animationNode(uNode, "#f9a8d4", 120);
            await sleep(150);
            animationNode(uNode, "#a21caf", 120);
        }
    }
    animationNode(uNode, "#f9a8d4", 120);
    await sleep(150);
    animationNode(uNode, "#a21caf", 120);
    
    uNode.data("status", 2);
    uNode.data("tc", t);
}

function animationNode(e, c, d){
    let node_ani = e.animation({
        style:{
            'background-color': c,
        },
        duration: d,
    });
    node_ani.play();
}

function animationEgde(e, c, d){
    let node_ani = e.animation({
        style:{
            'line-color': c,
        },
        duration: d,
    });
    node_ani.play();
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

document.getElementById("sortgraph").addEventListener("click", ()=>{
    var layout = cy.layout({
        name: 'cose-bilkent',
        animate: 'end',
        animationEasing: 'ease-out',
        animationDuration: 1000,
        randomize: true
      });

      layout.run();
})
function getKeyByValue(object, value) {
    return Object.keys(object).find(key => object[key] === value);
  }




async function BFS(gNodes){
    for(let i = 0; i < gNodes.length; i++){
        gNodes[i].data("status", 0);
        gNodes[i].data("parent", null);
        gNodes[i].data("pos", i);
    }

    let t = 0;
    let start_pos = 0;
    let node_input_selected = document.getElementById("input_node_value").value;
    let selectedNode = cy.elements(`node#${node_input_selected}`);
    if(selectedNode){
        start_pos = selectedNode.data("pos");
    }

    let i = start_pos;
    graphToTree(gNodes, gNodes[start_pos]);
    
}

async function graphToTree(graph, uNode){
    let output = {};
    for(let i = 0; i < graph.length; i++){
        graph[i].data("visited", 1);
          
    }
    uNode.data("visited", 0);
    //output[uNode.data("id")] =
    animationNode(uNode, "#a21caf", 150);
    await sleep(1000);
    graphSubTree(uNode);
    
    return  output;

}

async function graphSubTree(uNode){
    let cola = [[uNode[0], null]];

    while (cola.length>0){
        let actual = cola.shift();
        
        //console.log(actual);

        if(actual[0].data("visited")==1){
            actual[0].data("visited", 0);
            if(actual[1]!=null){

                let brother = actual[1].edgesWith(actual[0]);
                animationEgde(brother, "#ccc", 100);
                await sleep(500);
            }
            
            animationNode(actual[0], "#a21caf", 150);
            await sleep(1000);
            //console.log("ds");
            //await DFSVisit(gNodes, nbNodes[i], t);
            //animationNode(uNode, "#f9a8d4", 120);
            //await sleep(150);
            //animationNode(uNode, "#a21caf", 120);
        }

        let res = actual[0].neighborhood().filter("node[visited=1]");
        for(let i = 0; i < res.length; i++){
            res[i].data("parent", "dsf");
            //console.log(res[i]);
            cola.push([res[i], actual[0]]);
        }
        //cola.pop()
    }
    
}