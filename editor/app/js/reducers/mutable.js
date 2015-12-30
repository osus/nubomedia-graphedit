// Mutable section for dealing with non-reactive, external pieces
// Having this breaks the purity of React/Redux but we may need it
// until we figure out a better solution for having jsPlumb in the mix
// They should mutate the state in-place and return the passed in state.

import GraphEditor from '../GraphEditor'

var editor = null;
var editorContainer = null;

export function getEditor() {
  return editor;
}

export function setContainer(el) {
  editorContainer = el;
}

export function getEditedGraph() {
  if (editor) {
    return {
      nodes: editor.getNodes().map((node) =>
        ({type:node.type, name: node.name, x:node.x, y:node.y})
      ),
      connections: editor.getConnections()
    };
  }
  return {nodes:[], connections: []};
}

function setEditor(e) {
  if (editor && editor != e) {
    editor.destroy();
  }
  editor = e;
}

export function setupNewEditor(graph, nodedefs) {
  setEditor(null);
  if (graph) {
    setEditor(new GraphEditor(editorContainer));
    editor.batch( function(editor) {
      graph.nodes.forEach((node) => editor.createNode(node.type, nodedefs.defs[node.type], node.name, node.x, node.y));
      graph.connections.forEach((c) => editor.createConnection(c.source, c.sourceEP, c.target, c.targetEP));
    });
  }
}
