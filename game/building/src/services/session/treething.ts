/**
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {events} from 'camelot-unchained';

const assign = require('object-assign');

const RECEIVE_TREE = 'building/treething/RECEIVE-TREE';
const ADD_CHILD = 'building/treething/ADD-CHILD';
const REMOVE_CHILD = 'building/treething/REMOVE-CHILD';
const SELECT_NODE = 'building/treething/SELECT-NODE';

const win: any = window;
const fake: boolean = (win.cuAPI == null);

// cuAPI placeholders (they don't exist yet)

// Sample Data
const client_sampleData = {
  "root": {
    "id": "1000", "value": "Root",
    "children": [
      { "id": "1001", "value": "Child",
        "children": [
          { "id": "1003", "value": "GrandSon" },
          { "id": "1004", "value": "GrandDaughter" }
        ]
      },
      { "id": "1002", "value": "Sibling",
        "children": [
          { "id": "1005", "value": "StepChild" }
        ]
      }
    ]
  }
};

let client_BuildingTreeChangedCallback: (treeData: any) => void;
let client_BuildingTree: any = client_sampleData;
let client_BuildingTreeUniqueId: number = 1005;

function client__BuildingTreeChanged() {
  if (client_BuildingTreeChangedCallback) {
    client_BuildingTreeChangedCallback(client_BuildingTree);
  }
}

function client_OnBuildingTreeChanged(callback: (treeData: any) => void) {
  client_BuildingTreeChangedCallback = callback;
  setTimeout(() => client__BuildingTreeChanged(), 1);
}

function client_AddBuildingNode(parent: string, node: any) {
  console.log('ADD BUILDING NODE: parent=' + parent + ' node=' + JSON.stringify(node));
  node.id = ++client_BuildingTreeUniqueId;
  if (!client_BuildingTree) client_BuildingTree = { "root": null };
  if (!client_BuildingTree.root) {
    // no root node, this node becomes root
    client_BuildingTree.root = copy(node);
  } else {
    client_BuildingTree.root = copy(client_BuildingTree.root, {
      clean: true,
      copied: (from: TreeThingNode, to: TreeThingNode) => {
        if (from.id === parent) {
          if (!to.children) to.children = [];
          to.children.push(node);
        }
      }
    });
  }
  setTimeout(() => client__BuildingTreeChanged(), 1);
}

function client_RemoveBuildingNodeFromParent(parent: string) {
  console.log('REMOVE BUILDING NODE: parent=' + parent);
  client_BuildingTree.root = copy(client_BuildingTree.root, {
    clean: true,
    copied: (from: TreeThingNode, to: TreeThingNode) => {
      if (to.id === parent) {
        // remove the last child
        if (to.children) {
          to.children.pop();
        }
      }
    }
  });
  setTimeout(() => client__BuildingTreeChanged(), 1);
}

function client_SelectBuildingNode(id: string) {
  console.log('SELECT BUILDING NODE: id=' + id);
}

function client_UpdateBuildingTree(treeData: any) {
  client_BuildingTree = treeData;
  client__BuildingTreeChanged();      // simulate a tree update
}

// Actions

export function addChild(parent: TreeThingNode, node: TreeThingNode) {
  client_AddBuildingNode(parent ? parent.id : null, node);
  return {
    type: ADD_CHILD,
    parent: parent,
    node: node
  }
}

export function removeChild(parent: TreeThingNode) {
  client_RemoveBuildingNodeFromParent(parent.id);
  return {
    type: REMOVE_CHILD,
    parent: parent
  }
}

export function receive(treeData: any) {
  return {
    type: RECEIVE_TREE,
    data: treeData
  }
}

export function selectNode(node: TreeThingNode) {
  client_SelectBuildingNode(node ? node.id : null);
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

// deep-copy a tree node from a given root node
//  node: root node of the copy (can copy all or part of a tree by specifying the starting (root) node for the copy)
//  options:
//    clean: true/false -- if true, removes properties not provided by client (added by us, e.g. parent references)
//    copied: called after each node is copied with the old and new node.  Allows children to be inserted or removed
//    parent: parent element (used internally)
export function copy(node: TreeThingNode, options: any = {}) : TreeThingNode {
  if (node) {
    const copied: (from: TreeThingNode, to: TreeThingNode) => void = options && options.copied;
    const clean: TreeThingNode = options && options.clean;
    const root = <TreeThingNode>{};
    root.value = node.value;
    if (node.id) root.id = node.id;
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
}

// Insert a child node, creating a copy of the tree in the process
export function insert(root: TreeThingNode, parent: TreeThingNode, node: TreeThingNode) : TreeThingNode {
  if (!root) return copy(node);
  return copy(root, {
    copied: (from: TreeThingNode, to: TreeThingNode) => {
      if (from === parent) {
        if (!to.children) to.children = [];
        to.children.push(copy(node));
      }
    }
  });
}

// Remove a child node, creating a copy of the tree in the process
export function remove(root: TreeThingNode, parent: TreeThingNode) : TreeThingNode {
  if (!root) throw new Error("treething:remove() Attempt to remove a node from a non-existent tree");
  return copy(root, {
    copied: (from: TreeThingNode, to: TreeThingNode) => {
      if (from === parent) {
        if (to.children) {
          to.children.pop();
        }
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
  case ADD_CHILD:
    // add a dummy node, it will be replaced by the actual node as soon as we get the next
    // RECEIVE_TREE action.  The only difference is, this node doesn't yet have an ID
    const root: TreeThingNode = insert(state.root, action.parent, action.node);
    return assign({}, state, {
      root: root,
      selected: state.selected ? findNodeById(root, state.selected.id) : undefined
    });
  case REMOVE_CHILD:
    // remove the last child from the specified node
    return assign({}, state, { root: remove(state.root, action.parent) });
  case SELECT_NODE:
    // Make this node the selected node, or if already selected, deselect
    return assign({}, state, {
      selected: state.selected !== action.node ? findNode(state.root, action.node) : undefined
    });
  case RECEIVE_TREE:
    // RECEIVE a new tree from the client, happens after an add/remove or whenever
    // need to re-select selected node by ID
    if (!action.data) action.data = { root: undefined };
    return assign({}, state, {
      root: action.data.root,
      selected: state.selected ? findNodeById(action.data.root, state.selected.id) : undefined
    });
  }
  return state;
}
