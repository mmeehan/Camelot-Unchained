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
import {TreeThingNode} from '../../../../../../services/session/treething';

export interface NodeProps {
  node: TreeThingNode;
  selected: TreeThingNode;
  select: (node: TreeThingNode) => void;
}

export interface NodeState {
  expanded: boolean;
}

export default class Node extends React.Component<NodeProps, NodeState> {

  constructor(props: NodeProps) {
    super(props);
    this.expand.bind(this);
    this.select.bind(this);
    this.state = {
      expanded: false
    }
  }

  expand = (e: React.MouseEvent) => {
    this.setState({ expanded: !this.state.expanded });
    e.preventDefault();
    e.stopPropagation();
  }

  select = () => {
    this.props.select(this.props.node);
  }

  // recursively render this node and its children
  renderNode(node: TreeThingNode): JSX.Element {
    const isRoot = !node.parent;
    const hasChildren = node.children && node.children.length;
    const cls = [ 'building__treething-node' ];
    const isExpanded = this.state.expanded;
    const isSelected = this.props.selected === this.props.node;
    const arrow = isExpanded ? '▼' : '▶';
    cls.push(isRoot ? 'is-root' : 'has-parent');
    hasChildren && cls.push('has-children');
    isSelected && cls.push('is-selected');
    return (
      <div className={cls.join(' ')}>
        <div className='header' onClick={this.select}>
          { hasChildren
            ? (<span className='expand' onClick={this.expand}>{arrow}</span>)
            : (<span className='spacer'></span>)
          }
          <span className='value'>{node.value}</span>
        </div>
        { hasChildren && isExpanded
          ? <div className='children'>{
              node.children.map((node: TreeThingNode) => {
                return <Node key={node.id} node={node} select={this.props.select} selected={this.props.selected}/>
              })
            }</div>
          : undefined
        }
      </div>
    )
  }

  render() {
    const node = this.props.node;
    return node ? this.renderNode(node) : <div></div>;
  }
}