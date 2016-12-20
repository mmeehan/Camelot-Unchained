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

export interface NodeProps {
  node: TreeThingNode;
}

export interface NodeState {
}

export default class Node extends React.Component<NodeProps, NodeState> {

  constructor(props: NodeProps) {
    super(props);
    this.state = {
    }
  }

  // recursively render this node and its children
  renderNode(node: TreeThingNode): JSX.Element {
    if (!node) return <div></div>;
    const isRoot = !node.parent;
    const hasChildren = node.children && node.children.length;
    const cls = [ 'building__treething-node' ];
    const expanded = true;      // todo
    const arrow = expanded ? '▼' : '►';
    cls.push(isRoot ? 'isRoot' : 'hasParent');
    hasChildren && cls.push('hasChildren');
    return (
      <div className={cls.join(' ')}>
        <div className='header'>
          {hasChildren ? (<span className='expand'>{arrow}</span>) : (<span className='spacer'></span>)}
          {node.value}
        </div>
        {hasChildren && <div className='children'>{
          node.children.map((node: TreeThingNode) => {
            return this.renderNode(node);
          })
        }</div>}
      </div>
    )
  }

  render() {
    return this.renderNode(this.props.node);
  }
}