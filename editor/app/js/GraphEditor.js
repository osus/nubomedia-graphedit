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
    maxConnections: -1,
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

    constructor(container, projectcb, nodecb, validatecb) {
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

        // Handlers
        this.projectClickHandler = projectcb;
        this.nodeClickHandler    = nodecb;
        this.validateHandler     = validatecb;
        this.deselectNodeHandler = null;

        // Nodes
        this.nodes = [];
        this.selectedNode = null;
        this.copiedNode   = null;

        // Listener to deselected node when clicks in container
        this.instance.getContainer().addEventListener('click', (e) => {
            if (e.target == this.instance.getContainer()) {
                if (this.deselectNodeHandler) {
                    this.deselectNodeHandler();
                }
            }
        });

        // Validate on create connection
        this.instance.bind('connection', () => {
            this.validateEditor();
        });
        // Validate on delete connection
        this.instance.bind('connectionDetached', () => {
            this.validateEditor();
        });
        // Validate on create GraphEditor
        this.validateEditor();
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

    createNode(type, def, id, name, x, y, savedProps) {
        // Helper function to create the endpoints for the anchors of a given node
        var _addEndpoints = (toId, anchors) => {
            anchors.map((a) => {
                var uuid = makeUUID(toId, a.name);
                this.instance.addEndpoint(toId, a.source? sourceEndpoint: targetEndpoint, {
                    anchor: a.pos, uuid: uuid, parameters: (a.source? {srcEP: a.name} : {tgtEP: a.name}) });
            });
        };
        // Helper function to select node
        var _selectNode = (node) => {
            if (this.selectedNode != node) {
                _deselectNode();
                this.selectedNode       = node;
                node.element.className += " selected";
            } else {
                _deselectNode();
            }
        };
        // Helper function to unselect node
        var _deselectNode = () => {
            if (this.selectedNode) {
                this.selectedNode.element.className = this.selectedNode.element.className.replace(/\sselected\b/,'');
                this.selectedNode = null;
            }
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
            drag: (e) => { dragged = true }
        });
        let props = (savedProps) ? savedProps : mapObject(def.properties, (val, key) => val.default || "");
        let node = {element: el, type:type, id:id, name: name, properties: props, anchors: def.anchors, group: def.group};
        el.addEventListener("click", (e) => {
            if (dragged) {
                dragged = false;
                return;
            }
            _selectNode(node);
        });
        el.addEventListener("dblclick", (e) => {
            this.nodeClickHandler(this, node);
        });
        // Attach container event listener
        this.deselectNodeHandler = _deselectNode;
        // Add node
        this.nodes.push(node);

        // Validate on create node
        this.validateEditor();

        return el;
    }

    deleteNode(node) {
        var _deleteEndpoints = (toId, anchors) => {
            anchors.map((a) => {
                var uuid = makeUUID(toId, a.name);
                this.instance.deleteEndpoint(uuid);
            });
        };
        let ix = this.nodes.indexOf(node);
        if (ix != -1) {
            this.nodes.splice(ix, 1);
        }
        _deleteEndpoints(node.element.id, node.anchors);
        this.instance.getContainer().removeChild(node.element);
        this.selectedNode = (this.selectedNode != node) ? this.selectedNode : null;

        // Validate on delete node
        this.validateEditor();
    }

    copyNode(node) {
        this.copiedNode = node;
    }

    createConnection(src, srcEP, tgt, tgtEP) {
        this.instance.connect({uuids: [makeUUID(src,srcEP), makeUUID(tgt, tgtEP)]});
    }

    getNodes() {
        return this.nodes.map((node) => {
            let x = parseInt(node.element.style.left, 10);
            let y = parseInt(node.element.style.top, 10);
            return {type: node.type, id: node.id, name: node.name, x: x, y: y, properties: node.properties || {}};
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

    /**
     * This function validates all editor components.
     * Validate:
     *  - Project:
     *      - Validate if has nodes
     *  - Nodes:
     *      - Empty properties
     *      - Unused connections by group type:
     *          # filters: Validates one source and one target are
     *                     connected to another node.
     *          # hubs: At least one source and one target must be connected
     *          # elements: At least one target must be connected
     */
    validateEditor() {
        // Validator skeleton
        let validator = {
            error: false,
            nodes: {}
        };

        /*
            Nodes
         */
        this.nodes.forEach((node) => {
            // Validator node skeleton
            let nodeError = {
                anchors: {
                    sources: [],
                    targets: []
                },
                errors: {
                    properties: [],
                    connections: {
                        sources: [],
                        targets: []
                    }
                }
            };
            // Node Properties
            if(Object.keys(node.properties).length != 0) {
                for (let property in node.properties) {
                    if (node.properties.hasOwnProperty(property)) {
                        // Empty
                        if (node.properties[property] == "") {
                            nodeError.errors.properties.push({
                                property: property,
                                description: property + " is empty."
                            });
                        }
                    }
                }
            }
            // Node Anchors
            node.anchors.forEach((anchor) => {
                let anchorConnections = {
                    name: anchor.name,
                    connections: []
                };
                this.getConnections().forEach((connection) => {
                    if (connection.source == node.id && connection.sourceEP == anchor.name) {
                        anchorConnections.connections.push(connection);
                    }
                    if (connection.target == node.id && connection.targetEP == anchor.name) {
                        anchorConnections.connections.push(connection);
                    }
                });
                if (anchor.source) {
                    nodeError.anchors.sources.push(anchorConnections)
                } else {
                    nodeError.anchors.targets.push(anchorConnections);
                }
            });
            // Node connections
            switch(node.group) {
                case 'filters':
                    nodeError.anchors.sources.forEach((source) => {
                        if (source.connections.length == 0) {
                            nodeError.errors.connections.sources.push({
                                property: "Source connection",
                                description: "This filter node hasn't connection source connected to another node."
                            });
                        }
                    });
                    nodeError.anchors.targets.forEach((target) => {
                        if (target.connections.length == 0) {
                            nodeError.errors.connections.targets.push({
                                property: "Target connection",
                                description: "This filter node hasn't connection target connected by another node."
                            });
                        }
                    });
                    break;

                case 'hubs':
                    let hubSourceHaveConnection = false;
                    let hubTargetHaveConnection = false;
                    nodeError.anchors.sources.forEach((source) => {
                        if (!hubSourceHaveConnection && source.connections.length > 0) {
                            hubSourceHaveConnection = true;
                        }
                    });
                    nodeError.anchors.targets.forEach((target) => {
                        if (!hubTargetHaveConnection && target.connections.length > 0) {
                            hubTargetHaveConnection = true;
                        }
                    });
                    if (!hubSourceHaveConnection) {
                        nodeError.errors.connections.sources.push({
                            property: "Source connection",
                            description: "This hub node needs at least be connected to another node."
                        });
                    }
                    if (!hubTargetHaveConnection) {
                        nodeError.errors.connections.targets.push({
                            property: "Target connection",
                            description: "This hub node requires at least one connection from another node to its target."
                        });
                    }
                    break;

                case 'elements':
                    let elementTargetHaveConnection = false;
                    nodeError.anchors.targets.forEach((target) => {
                        if (!elementTargetHaveConnection && target.connections.length > 0) {
                            elementTargetHaveConnection = true;
                        }
                    });
                    if (!elementTargetHaveConnection) {
                        nodeError.errors.connections.targets.push({
                            property: "Target connection",
                            description: "This element node requires at least one connection from another node to its target."
                        });
                    }
                    break;
            }

            if (nodeError.errors.properties.length > 0 ||
                nodeError.errors.connections.sources.length > 0 ||
                nodeError.errors.connections.targets.length > 0) {
                validator.nodes[node.name] = nodeError;
            }
        });

        /*
            Project
         */
        if (this.nodes.length == 0) {
            validator.nodes["project"] = {
                anchors: {
                    sources: {},
                    targets: {}
                },
                errors: {
                    properties: [{
                        property: "Editor",
                        description: "No nodes created."
                    }],
                    connections: {
                        sources: [],
                        targets: []
                    }
                }
            };
        }
        validator.error = Object.keys(validator.nodes).length != 0;
        this.validateHandler(validator);
    }
}
