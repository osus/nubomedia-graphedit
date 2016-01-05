// Graph Editor widget for the Nubomedia Graph Editor tool
// Uses jsPlumb as the connector library

import { mapObject } from './util'

// this is the paint style for the connecting lines..
const connectorPaintStyle = {
    lineWidth: 4,
    strokeStyle: '#61B7CF',
    joinstyle: 'round',
    outlineColor: 'white',
    outlineWidth: 2
};
// .. and this is the hover style.
const connectorHoverStyle = {
    lineWidth: 4,
    strokeStyle: '#216477',
    outlineWidth: 2,
    outlineColor: 'white'
};
const endpointHoverStyle = {
    fillStyle: '#216477',
    strokeStyle: '#216477'
};
// the definition of source endpoints (the small blue ones)
const sourceEndpoint = {
    endpoint: 'Dot',
    paintStyle: {
        strokeStyle: '#7AB02C',
        fillStyle: 'transparent',
        radius: 7,
        lineWidth: 3
    },
    isSource: true,
    connector: [ 'Flowchart', { stub: [40, 60], gap: 10, cornerRadius: 5, alwaysRespectStubs: true } ],
    connectorStyle: connectorPaintStyle,
    hoverPaintStyle: endpointHoverStyle,
    connectorHoverStyle: connectorHoverStyle,
    dragOptions: {},
};
// the definition of target endpoints (will appear when the user drags a connection)
const targetEndpoint = {
    endpoint: 'Dot',
    paintStyle: { fillStyle: '#7AB02C', radius: 11 },
    hoverPaintStyle: endpointHoverStyle,
    maxConnections: -1,
    dropOptions: { hoverClass: 'hover', activeClass: 'active' },
    isTarget: true,
};

function makeUUID(node, ep) { return `${node}.${ep}` }


export default class GraphEditor {

    constructor(container, nodecb) {
        this.instance = jsPlumb.getInstance({
            // default drag options
            DragOptions: { cursor: 'pointer', zIndex: 2000 },
            // the overlays to decorate each connection with.  note that the label overlay uses a function to generate the label text; in this
            // case it returns the 'labelText' member that we set on each connection in the 'init' method below.
            ConnectionOverlays: [
                [ 'Arrow', { location: 1 } ],
            ]
        });
        this.instance.setContainer(container);
        this.nodeClickHandler = nodecb;
        this.nodes = [];

        // var basicType = {
        //     connector: 'StateMachine',
        //     paintStyle: { strokeStyle: 'red', lineWidth: 4 },
        //     hoverPaintStyle: { strokeStyle: 'blue' },
        //     overlays: ['Arrow']
        // };
        // this.instance.registerConnectionType('basic', basicType);

        // // listen for new connections; initialise them the same way we initialise the connections at startup.
        // this.instance.bind('connection', (connInfo/*, originalEvent*/) => {
        //     this.initConnection(connInfo.connection);
        // });

        // // listen for clicks on connections
        // this.instance.bind('click', (connection/*, originalEvent*/) => {
        //    // if (confirm('Delete connection from ' + conn.sourceId + ' to ' + conn.targetId + '?'))
        //      //   instance.detach(conn);
        //     connection.toggleType('basic'); // Sample operation
        //     console.log('click(): connection', connection);
        // });

        // this.instance.bind('connectionDrag', (connection) => {
        //     console.log('connectionDrag(): connection ' + connection.id + ' is being dragged. suspendedElement is ', connection.suspendedElement, ' of type ', connection.suspendedElementType);
        // });

        // this.instance.bind('connectionDragStop', (connection) => {
        //     console.log('connectionDragStop(): connection ' + connection.id + ' was dragged\n', connection);
        // });

        // this.instance.bind('connectionMoved', (params) => {
        //     console.log('connectionMoved(): connection ' + params.connection.id + ' was moved\n', params);
        // });
    }

    destroy() {
        let c = this.instance.getContainer();
        $(c).empty();
        this.nodes = [];
        this.instance.reset();
    }

    batch(cb) {
        this.instance.batch( () => {
            cb(this);
        });
    }

    createNode(type, def, id, x, y) {

        // Helper function to create the endpoints for the anchors of a given node
        var _addEndpoints = (toId, anchors) => {
            anchors.map((a) => {
                var uuid = makeUUID(toId, a.name);
                this.instance.addEndpoint(toId, a.source? sourceEndpoint: targetEndpoint, {
                    anchor: a.pos, uuid: uuid, parameters: (a.source? {srcEP: a.name} : {tgtEP: a.name}) });
            });
        };

        // Create the node DOM element and the corresponding jsPlumb endpoints
        var el = document.createElement("div");
        el.id = id;
        el.style.top = y + "px";
        el.style.left = x + "px";
        el.style.backgroundImage = `url('images/nodes/${def.image.name}.png')`;
        el.style.width = def.image.width + "px";
        el.style.height = def.image.height + "px";
        el.className = "nubogednode";// nubogednt_" + type;
        this.instance.getContainer().appendChild(el);
        _addEndpoints(id, def.anchors);
        // Prevent clicks when drag/drop
        var dragged = false;
        this.instance.draggable(el, {
            grid: [20, 20],
            drag: (e, ui) => dragged = true
        });
        let props = mapObject(def.properties, (val, key) => val.default || "");
        let node = {element: el, type:type, name:id, properties: props};
        el.addEventListener("click", (e) => {
            if (dragged) {
                dragged = false;
                return;
            }
            this.nodeClickHandler(this, node)
        });
        this.nodes.push(node);
        return el;
    }

    createConnection(src, srcEP, tgt, tgtEP) {
        this.instance.connect({uuids: [makeUUID(src,srcEP), makeUUID(tgt,tgtEP)]});
    }

    getNodes() {
        return this.nodes.map((node) => {
            let x = parseInt(node.element.style.left, 10);
            let y = parseInt(node.element.style.top, 10);
            return { type:node.type, name:node.name, x:x, y:y, properties: node.properties || {}};
        });
    }

    getConnections() {
        return this.instance.getConnections().map((connection) => ({
            source: connection.sourceId,
            sourceEP: connection.getParameters().srcEP,
            target: connection.targetId,
            targetEP: connection.getParameters().tgtEP,
        }));
    }

    // initConnection(connection) {
    //     //connection.getOverlay('label').setLabel(connection.sourceId.substring(15) + '-' + connection.targetId.substring(15));
    //     console.log("Connection: ", connection);
    // }
}
