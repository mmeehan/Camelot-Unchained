/**
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {events} from 'camelot-unchained';

const assign = require('object-assign');

const win: any = window;
const fake: boolean = (win.cuAPI == null);

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

// module definition

import { Module, generateID } from 'redux-typed-modules';

const module = new Module<TreeThingState, any>({
  initialState: {
    root: null,
    selected: null
  }
});

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

function client_RemoveBuildingNode(node: string) {
  console.log('REMOVE BUILDING NODE: node=' + node);
  if (!client_BuildingTree) throw new Error("client_RemoveBuildingNode() called with no tree");
  client_BuildingTree.root = copy(client_BuildingTree.root, {
    clean: true,
    remove: findNodeById(client_BuildingTree.root, node)
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

// Initialisation
export function initializeTreeThing(dispatch: any) {
  // listen for tree updates
  client_OnBuildingTreeChanged((treeData: any) => {
    dispatch(receive(treeData));
  })
}

// deep-copy a tree node from a given root node
//  node: root node of the copy (can copy all or part of a tree by specifying the starting (root) node for the copy)
//  options:
//    clean: true/false -- if true, removes properties not provided by client (added by us, e.g. parent references)
//    copied: called after each node is copied with the old and new node.  Allows children to be inserted or removed
//    parent: parent element (used internally)
export function copy(node: TreeThingNode, options: any = {}) : TreeThingNode {
  if (node) {
    const remove: TreeThingNode = options.remove;
    if (node === remove) return;
    const copied: (from: TreeThingNode, to: TreeThingNode) => void = options.copied;
    const clean: TreeThingNode = options.clean;
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
        const child = copy(node.children[i], assign({}, options, { parent: node }));
        if (child) {
          root.children.push(child);
        }
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
export function remove(root: TreeThingNode, node: TreeThingNode) : TreeThingNode {
  if (!root) throw new Error("treething:remove() Attempt to remove a node from a non-existent tree");
  return copy(root, { remove: node });
}

// Search functions
export function findNode(root: TreeThingNode, node: TreeThingNode): TreeThingNode {
  if (!root) return;
  if (root === node) return root;
  if (root.children) {
    for (let i = 0; i < root.children.length; ++i) {
      const found = findNode(root.children[i], node);
      if (found) return found;
    }
  }
}

export function findNodeById(root: TreeThingNode, id: string): TreeThingNode {
  if (!root) return;
  if (root.id === id) return root;
  if (root.children) {
    for (let i = 0; i < root.children.length; ++i) {
      const found = findNodeById(root.children[i], id);
      if (found) return found;
    }
  }
}

// addChild action

interface AddChildAction {
  id: string;
  parent: TreeThingNode;
  node: TreeThingNode;
}

interface AddChildActionArgs {
  parent: TreeThingNode;
  node: TreeThingNode;
}

export const addChild = module.createAction<AddChildAction, AddChildActionArgs>({
  action: (args: AddChildActionArgs) => {
    const { parent, node } = args;
    client_AddBuildingNode(parent ? parent.id : null, node);
    return {
      id: 'building/treething/ADD-CHILD',
      parent: parent,
      node: node
    }
  },
  reducer: (state, action) => {
    // add a dummy node, it will be replaced by the actual node as soon as we get the next
    // RECEIVE_TREE action.  The only difference is, this node doesn't yet have an ID
    const root: TreeThingNode = insert(state.root, action.parent, action.node);
    return {
      root: root,
      selected: state.selected ? findNodeById(root, state.selected.id) : undefined
    };
  }
});

// removeChild action

interface RemoveNodeAction {
  id: string;
  node: TreeThingNode;
}

interface RemoveNodeActionArgs {
  node: TreeThingNode;
}

export const removeNode = module.createAction<RemoveNodeAction, RemoveNodeActionArgs>({
  action: (args: RemoveNodeActionArgs) => {
    const { node } = args;
    client_RemoveBuildingNode(node.id);
    return {
      id: 'building/treething/REMOVE-NODE',
      node: node
    }
  },
  reducer: (state, action) => {
    // remove the selected node
    return { root: remove(state.root, action.node) };
  }
});

// receive action

interface ReceiveAction {
  id: string;
  data: any
}

interface ReceiveActionArgs {
  data: any
}

export const receive = module.createAction<ReceiveAction, ReceiveActionArgs>({
  action: (args: ReceiveActionArgs) => {
    const { data } = args;
    return {
      id: 'building/treething/RECEIVE',
      data: data
    }
  },
  reducer: (state, action) => {
    // RECEIVE a new tree from the client, happens after an add/remove or whenever
    // need to re-select selected node by ID
    const root = action.data && action.data.root;
    return {
      root: root,
      selected: state.selected ? findNodeById(root, state.selected.id) : undefined
    };
  }
});

// selectNode action

interface SelectNodeAction {
  id: string;
  node: TreeThingNode;
}

interface SelectNodeActionArgs {
  node: TreeThingNode;
}

export const selectNode = module.createAction<SelectNodeAction, SelectNodeActionArgs>({
  action: (args: SelectNodeActionArgs) => {
    const { node } = args;
  client_SelectBuildingNode(node ? node.id : null);
    return {
      id: 'building/treething/SELECT-NODE',
      node: node
    }
  },
  reducer: (state, action) => {
    // Make this node the selected node, or if already selected, deselect
    return {
      selected: state.selected !== action.node ? findNode(state.root, action.node) : undefined
    };
  }
});

// Reducer
export default module.createReducer();
