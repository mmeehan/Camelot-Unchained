/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 *
 * @Author: Mehuge (mehuge@sorcerer.co.uk)
 * @Date: 2016-12-16
 * @Last Modified by:
 * @Last Modified time:
 */

import * as React from 'react';
import {connect} from 'react-redux';
import {buildUIMode} from 'camelot-unchained';

import {GlobalState} from '../../services/session/reducer';
import SavedDraggable, {Anchor} from '../SavedDraggable';

import {TreeThingNode, selectNode, addChild, removeChild} from '../../services/session/treething';
import TreeControl from './components/TreeControl';

function select(state: GlobalState): TreeViewProps {
  return {
    root: state.treeThing.root,
    selected: state.treeThing.selected
  }
}

export interface TreeViewProps {
  root: TreeThingNode;
  selected: TreeThingNode;
  dispatch?: (action: any) => void;
}

export interface TreeViewState {
}

class TreeView extends React.Component<TreeViewProps, TreeViewState> {

  constructor(props: TreeViewProps) {
    super(props);
    this.state = {
    }
  }

  // add a child
  add = () => {
    const parent = this.props.selected;
    const node: TreeThingNode = {
      value: "New Child"
    };
    if (parent) {
      this.props.dispatch(addChild(parent, node));
    } else if (!this.props.root) {
      // there is no root node, adding a child becomes root
      this.props.dispatch(addChild(null, node));
    }
  }

  // remove a child
  remove = () => {
    const parent = this.props.selected;
    if (parent) {
      this.props.dispatch(removeChild(parent));
    }
  }

  private _selectNode = (node: TreeThingNode) => {
    this.props.dispatch(selectNode(node));
  }

  render() {
    const canAddChild = this.props.selected || !this.props.root;
    const canRemoveChild = this.props.selected && this.props.selected.children && this.props.selected.children.length;
    return (
      <SavedDraggable saveName="building/treething"
        defaultX={[0, Anchor.TO_START]}
        defaultY={[-200, Anchor.TO_CENTER]}>
        <div className='building__treething-view dragHandle'>
          <TreeControl root={this.props.root} select={this._selectNode} selected={this.props.selected}/>
          {canAddChild &&
            <div className='building__treething-button building__treething-add' onClick={this.add}>
              Add Child
            </div>
          }
          {canRemoveChild &&
            <div className='building__treething-button building__treething-remove' onClick={this.remove}>
              Remove Child
            </div>
          }
        </div>
      </SavedDraggable>
    )
  }
}

export default connect(select)(TreeView);