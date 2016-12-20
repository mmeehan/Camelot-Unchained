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

import {TreeThingNode} from '../../services/session/treething';
import Node from './components/Node';

function select(state: GlobalState): any {
  return {
     treeThing: state.treeThing
  }
}

export interface TreeViewProps {
  root: TreeThingNode;
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
  add(e: React.MouseEvent) {
    debugger;
  }

  remove(e: React.MouseEvent) {
    debugger;
  }

  render() {
    return (
      <SavedDraggable saveName="building/treething"
        defaultX={[0, Anchor.TO_START]}
        defaultY={[-200, Anchor.TO_CENTER]}>
        <div className='building__treething-view dragHandle'>
          <div className='building__treething-tree'>
            <Node node={this.props.root}/>
          </div>
          <div className='building__treething-button building__treething-add' onClick={this.add}>
            Add Child
          </div>
          <div className='building__treething-button building__treething-remove' onClick={this.remove}>
            Remove Child
          </div>
        </div>
      </SavedDraggable>
    )
  }
}

export default connect(select)(TreeView);