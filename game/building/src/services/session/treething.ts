/**
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {events} from 'camelot-unchained';

const assign = require('object-assign');

const RECEIVE_TREE = 'building/treething/RECEIVE-TREE';
const ADD_NODE = 'building/treething/ADD-NODE';
const SELECT_NODE = 'building/treething/SELECT-NODE';

const win: any = window;
const fake: boolean = (win.cuAPI == null);

// cuAPI placeholders (they don't exist yet)

let client_BuildingTreeChangedCallback: (treeData: any) => void;
let client_BuildingTree: any = {};
let client_BuildingTreeUniqueId: number = 999;

function client__BuildingTreeChanged() {
  if (client_BuildingTreeChangedCallback) {
    client_BuildingTreeChangedCallback(client_BuildingTree);
  }
}

function client_OnBuildingTreeChanged(callback: (treeData: any) => void) {
  client_BuildingTreeChangedCallback = callback;
}

function client_AddTreeNode(parent: string, node: any) {
  node.id = ++client_BuildingTreeUniqueId;
  client_BuildingTree.root = copy(client_BuildingTree.root, {
    clean: true,
    copied: (from: TreeThingNode, to: TreeThingNode) => {
      if (from.id === parent) {
        if (!to.children) to.children = [];
        to.children.push(node);
      }
    }
  });
  setTimeout(() => client__BuildingTreeChanged(), 1);
}

function client_UpdateBuildingTree(treeData: any) {
  client_BuildingTree = treeData;
  client__BuildingTreeChanged();      // simulate a tree update
}

// Actions

export function add(parent: TreeThingNode, node: TreeThingNode) {
  client_AddTreeNode(parent.id, node);
  return {
    type: ADD_NODE,
    parent: parent,
    node: node
  }
}

export function receive(treeData: any) {
  return {
    type: RECEIVE_TREE,
    data: treeData
  }
}

export function select(node: TreeThingNode) {
  return {
    type: SELECT_NODE,
    node: node
  }
}

// Initialisation

export function initializeTreeThing(dispatch: any) {

  // listen for tree updates
  client_OnBuildingTreeChanged((treeData: any) => {
    dispatch(receive(treeData));
  })

  // TEMP: Trigger pretend client update of tree data
  client_UpdateBuildingTree(treeFromJSON(sampleJSON));
}

// Types

export interface TreeThingNode {
  id?: string;
  value: string|number;
  parent?: TreeThingNode;
  children?: TreeThingNode[];
}

export interface TreeThingState {
  root: TreeThingNode;
  selected: TreeThingNode;
}

const initialState : TreeThingState = {
  root: null,
  selected: null
}

// Sample Data

const sampleJSON : string = `
{
  "root": {
    "id": "aaf248a4-1f75-4c2f-80a2-ffd6d540b7db", "value": "Root",
    "children": [
      { "id": "d18bd5a2-be6f-41a4-89de-7fce5dac2717", "value": "Child",
        "children": [
          { "id": "62bd1ef7-597f-488b-b9ff-b19d98c42010", "value": "GrandSon" },
          { "id": "f27dd32c-5058-4386-8bd3-f8cf92756730", "value": "GrandDaughter" }
        ]
      },
      { "id": "c0741828-51e2-4c54-b996-d6559e03b67d", "value": "Sibling",
        "children": [
          { "id": "cda37d02-292a-4a07-918c-d5846ff8ee8b", "value": "StepChild" }
        ]
      }
    ]
  }
}`;

// Conversion functions

export function treeFromJSON(json: string) {
  try {
    return JSON.parse(json);
  } catch(e) {
    console.error(e);
    return null;
  }
}

export function treeToJSON(root: TreeThingNode) {
  return JSON.stringify(root);
}

// deep-copy a tree node from a given root node
//  node: root node of the copy (can copy all or part of a tree by specifying the starting (root) node for the copy)
//  options:
//    clean: true/false -- if true, removes properties not provided by client (added by us, e.g. parent references)
//    copied: called after each node is copied with the old and new node.  Allows children to be inserted or removed
//    parent: parent element (used internally)
export function copy(node: TreeThingNode, options: any = {}) : TreeThingNode {
  const copied: (from: TreeThingNode, to: TreeThingNode) => void = options && options.copied;
  const clean: TreeThingNode = options && options.clean;
  const root = <TreeThingNode>{};
  if (node.id) root.id = node.id;
  root.value = node.value;
  if (!clean) {
    let parent: TreeThingNode = options && options.parent;
    parent = parent || node.parent;
    if (parent) root.parent = parent;
  }
  if (node.children) {
    root.children = <TreeThingNode[]>[];
    for (var i = 0; i < node.children.length; ++i) {
      root.children.push(copy(node.children[i], { parent: node, copied: copied, clean: clean }));
    }
  }
  if (copied) copied(node, root);
  return root;
}

// Insert a child node, creating a copy of the tree in the process
export function insert(root: TreeThingNode, parent: TreeThingNode, node: TreeThingNode) {
  return copy(root, {
    copied: (from: TreeThingNode, to: TreeThingNode) => {
      if (from === parent) {
        if (!to.children) to.children = [];
        to.children.push(copy(node));
      }
    }
  });
}

// Search functions
export function findNode(root: TreeThingNode, node: TreeThingNode): TreeThingNode {
  if (root === node) return root;
  if (root.children) {
    for (let i = 0; i < root.children.length; ++i) {
      const found = findNode(root.children[i], node);
      if (found) return found;
    }
  }
}

export function findNodeById(root: TreeThingNode, id: string): TreeThingNode {
  if (root.id === id) return root;
  if (root.children) {
    for (let i = 0; i < root.children.length; ++i) {
      const found = findNodeById(root.children[i], id);
      if (found) return found;
    }
  }
}

// Reducer

export default function reducer(state: TreeThingState = initialState, action: any = {}): TreeThingState {
  switch (action.type) {
  case ADD_NODE:
    // add a dummy node, it will be replaced by the actual node as soon as we get the next
    // RECEIVE_TREE action.  The only difference is, this node doesn't yet have an ID
    const root = insert(state.root, action.parent, action.node);
    return assign({}, state, {
      root: root,
      selected: state.selected ? findNodeById(root, state.selected.id) : undefined
    });
  case SELECT_NODE:
    return assign({}, state, {
      selected: state.selected !== action.node ? findNode(state.root, action.node) : undefined
    });
  case RECEIVE_TREE:
    // RECEIVE will parse the incomming JSON and provide a new Javascript object
    // from it, so we can just assign it to state.
    return assign({}, state, {
      root: action.data.root,
      selected: state.selected ? findNodeById(action.data.root, state.selected.id) : undefined
    });
  }
  return state;
}
