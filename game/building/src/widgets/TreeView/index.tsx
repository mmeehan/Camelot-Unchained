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

import {TreeThingNode, selectNode, addChild, removeNode} from '../../services/session/treething';
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
  adding: boolean;
}

class TreeView extends React.Component<TreeViewProps, TreeViewState> {

  constructor(props: TreeViewProps) {
    super(props);
    this.state = {
      adding: false
    }
  }

  // remove selected Node
  removeNode = () => {
    const node = this.props.selected;
    if (node) {
      this.props.dispatch(removeNode({ node: node }));
    }
  }

  private _selectNode = (node: TreeThingNode) => {
    this.props.dispatch(selectNode({ node: node }));
  }

  private _clickedAdd = () => {
    this.setState({ adding: !this.state.adding });
  }

  private _add = (e: React.MouseEvent) => {
    const target: HTMLDivElement = e.target as HTMLDivElement;
    const node: TreeThingNode = {
      value: target.textContent
    };
    this.setState({ adding: false });
    const parent = this.props.selected;
    if (parent) {
      this.props.dispatch(addChild({ parent: parent, node: node }));
    } else if (!this.props.root) {
      // there is no root node, adding a child becomes root
      this.props.dispatch(addChild({ parent: null, node: node }));
    }
  }

  render() {
    const canAddChild = this.props.selected || !this.props.root;
    const canRemoveNode = this.props.selected;
    const isAdding = this.state.adding;
    return (
      <SavedDraggable saveName="building/treething"
        defaultX={[0, Anchor.TO_START]}
        defaultY={[-200, Anchor.TO_CENTER]}>
        <div className='building__treething-view dragHandle'>
          <TreeControl root={this.props.root} select={this._selectNode} selected={this.props.selected}/>
          { canAddChild
            ? <div className='building__treething-button building__treething-add' onClick={this._clickedAdd}>
                <div>Add</div>
                { isAdding
                  ? <div className='building__treething-popup' onClick={this._add}>
                      <div>Scale</div>
                      <div>Cylinder</div>
                      <div>Rotate</div>
                    </div>
                  : undefined
                }
              </div>
            : undefined
          }
          { canRemoveNode
            ? <div className='building__treething-button building__treething-remove' onClick={this.removeNode}>
                Remove
              </div>
            : undefined
          }
        </div>
      </SavedDraggable>
    )
  }
}

export default connect(select)(TreeView);