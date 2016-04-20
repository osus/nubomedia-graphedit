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
        let node = {element: el, type:type, id:id, name: name, properties: props, anchors: def.anchors};
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

    // TODO: Finish validations
    validateEditor() {
        // Validator skeleton
        let validator = {
            error: '',
            nodes: []
        };

        /* -------------------
         *  VALIDATION: If the editor doesn't have nodes
         * ------------------- */
        if (this.nodes.length == 0) {
            validator.error = true;
            validator.nodes["general"] = [{
                property: "Empty",
                description: "No nodes created."
            }];
        }

        this.nodes.forEach((node) => {
            // Validator node skeleton
            validator.nodes[node.name] = {
                connections: {
                    sources: {},
                    targets: {}
                },
                properties: []
            };

            /* -------------------
             *  VALIDATION: Validate if the node have empty properties
             * ------------------- */

            if(Object.keys(node.properties).length != 0) {
                for (let property in node.properties) {
                    if (node.properties.hasOwnProperty(property)) {

                        // Empty
                        if (node.properties[property] == "") {
                            validator.error = true;
                            validator.nodes[node.name].properties.push({
                                property: property,
                                description: property.charAt(0).toUpperCase() + property.slice(1) + " is empty."
                            });
                        }
                    }
                }
            }

            /* -------------------
             *  VALIDATION: Validate if the node connections are corrected by type
             * ------------------- */

            // Get all sources and targets anchors connections
            node.anchors.forEach((anchor) => {
                if (anchor.source) {
                    validator.nodes[node.name].connections.sources[anchor.name] = [];
                } else {
                    validator.nodes[node.name].connections.targets[anchor.name] = []
                }
                this.getConnections().forEach((connection) => {
                    if (connection.source == node.name && connection.sourceEP == anchor.name) {
                        validator.nodes[node.name].connections.sources[anchor.name].push(connection);
                    }
                    if (connection.target == node.name && connection.targetEP == anchor.name) {
                        validator.nodes[node.name].connections.targets[anchor.name].push(connection);
                    }
                });
            });
            // Filter validations by node type
            switch(node.group) {
                case 'filters':
                break;

                case 'hubs':
                break;

                case 'elements':
                break;
            }
        });

        return validator;
    }
}
