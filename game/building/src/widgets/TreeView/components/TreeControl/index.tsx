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
import {TreeThingNode} from '../../../../services/session/treething';
import Node from './components/Node';

export interface TreeControlProps {
  root: TreeThingNode;
  selected: TreeThingNode;
  select: (node: TreeThingNode) => void;
}

export interface TreeControlState {
}

export default class TreeControl extends React.Component<TreeControlProps, TreeControlState> {

  constructor(props: TreeControlProps) {
    super(props);
    this.select.bind(this);
    this.state = { };
  }

  select() {
    this.props.select(this.props.root);
  }

  render() {
    return (
      <div className='building__treething-tree'>
        <Node node={this.props.root} select={this.props.select} selected={this.props.selected}/>
      </div>
    );
  }
}
