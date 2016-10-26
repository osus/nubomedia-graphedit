/*
 * (C) Copyright 2016 NUBOMEDIA (http://www.nubomedia.eu)
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */
// Mutable section for dealing with non-reactive, external pieces
// Having this breaks the purity of React/Redux but we may need it
// until we figure out a better solution for having jsPlumb in the mix
// They should mutate the state in-place and return the passed in state.

import GraphEditor from '../GraphEditor'

var editor = null;
var editorContainer   = null;
var editorProjectcb   = null;
var editorNodecb      = null;
var editorValidatecb  = null;
var editorGeneratecodecb  = null;

export function getEditor() {
  return editor;
}

export function setContainer(el, projectcb, nodecb, validatecb, generatecodecb) {
  editorContainer   = el;
  editorProjectcb   = projectcb;
  editorNodecb      = nodecb;
  editorValidatecb  = validatecb;
  editorGeneratecodecb = generatecodecb;
}

export function getEditedGraph() {
  if (editor) {
    return {
      nodes: editor.getNodes().map((node) =>
        ({type: node.type, id: node.id, name: node.name, x: node.x, y: node.y, properties: node.properties})
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
    setEditor(new GraphEditor(editorContainer, editorProjectcb, editorNodecb, editorValidatecb, editorGeneratecodecb));
    editor.batch( function(editor) {
      graph.nodes.forEach((node) => editor.createNode(node.type, nodedefs.defs[node.type], node.id, node.name, node.x, node.y, node.properties));
      graph.connections.forEach((c) => editor.createConnection(c.source, c.sourceEP, c.target, c.targetEP));
    });
  }
}
