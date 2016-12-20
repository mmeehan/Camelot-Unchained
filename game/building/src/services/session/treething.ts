/**
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {events} from 'camelot-unchained';

const assign = require('object-assign');

const RECEIVE_TREE = 'building/treething/RECEIVE-TREE';
const ADD_NODE = 'building/treething/ADD-NODE';

const win: any = window;
const fake: boolean = (win.cuAPI == null);

function add(key: string, what: string) {
  return {
    type: ADD_NODE,
  }
}

function receive(json: string) {
  return {
    type: RECEIVE_TREE,
    data: treeFromJSON(json)
  }
}

export function initializeTreeThing(dispatch: any) {
  // dispatch test data
  dispatch(receive(sampleJSON));
}

export interface TreeThingNode {
  value: string|number;
  parent?: TreeThingNode;
  children?: TreeThingNode[];
}

export interface TreeThingState {
  root: TreeThingNode;
}

const initialState : TreeThingState = {
  root: null
}

const sampleJSON : string = `
{
  "root": {
    "value": "Root",
    "children": [
      { "value": "Child", "children": [
        { "value": "GrandSon" },
        { "value": "GrandDaughter" }
      ] },
      { "value": "Sibling", "children": [
        { "value": "StepChild" }
      ] }
    ]
  }
}`;

export function treeFromJSON(json: string) {
  try {
    const data = JSON.parse(json);
    return assign({}, { root: copy(data.root) });
  } catch(e) {
    console.error(e);
    return null;
  }
}

export function treeToJSON(root: TreeThingNode) {
  return JSON.stringify(root);
}

// deep-copy a tree node from a given root node
export function copy(node: TreeThingNode, parent: TreeThingNode = undefined) : TreeThingNode {
  const root = <TreeThingNode>{};
  root.value = node.value;
  parent = parent || node.parent;
  if (parent) root.parent = parent;
  if (node.children) {
    root.children = <TreeThingNode[]>[];
    for (var i = 0; i < node.children.length; ++i) {
      root.children.push(copy(node.children[i], node));
    }
  }
  return root;
}

export function push(parent: TreeThingNode, value: string|number) : TreeThingNode {
  const node = <TreeThingNode>{
    parent: parent,
    value: value
  };
  if (!parent.children) parent.children = <TreeThingNode[]>[];
  parent.children.push(node);
  return node;
}

export function pop(parent: TreeThingNode) : TreeThingNode {
  if (parent.children) return parent.children.pop();
}

export default function reducer(state: TreeThingState = initialState, action: any = {}): TreeThingState {
  switch (action.type) {
  case ADD_NODE:
    // humm... not sure what doing here yet
    return assign({}, state);
  case RECEIVE_TREE:
    // RECEIVE will parse the incomming JSON and provide a new Javascript object
    // from it, so we can just assign it to state.
    return assign({}, state, action.data);
  }
  return state;
}
