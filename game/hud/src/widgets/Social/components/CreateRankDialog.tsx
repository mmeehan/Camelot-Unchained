/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import * as React from 'react';
import { StyleSheet, css, StyleDeclaration } from 'aphrodite';
import { ql, /*webAPI, client,*/ Spinner, Tooltip, Input, DualListSelect, FlatButton } from '@csegames/camelot-unchained';

import GroupTitle from './GroupTitle';

export interface CreateRankStyle extends StyleDeclaration {
  container: React.CSSProperties;
  contentWrapper: React.CSSProperties;
  buttons: React.CSSProperties;
}

export const defaultCreateRankStyle: CreateRankStyle = {
  container: {
    width: '700px',
    position: 'relative',
  },

  contentWrapper: {
    padding: '20px 20px 0px 20px',
  },

  buttons: {
    display: 'flex',
    justifyContent: 'flex-end',
    alignContent: 'center',
  },
};

export interface CreateRankProps {
  dispatch: (action: any) => any;
  groupId: string;
  permissions: ql.PermissionInfo[];
  onCancel: () => void;
  onCreated: () => void;
  styles?: Partial<CreateRankStyle>;
}

export interface CreateRankState {
  permissions: {};
  requestActive: boolean;
  success: boolean;
  errors: string;
  name: string;
  level: number;
}

class CreateRankDialog extends React.Component<CreateRankProps, CreateRankState> {

  private nameInputRef: HTMLInputElement = null;
  private levelInputRef: HTMLInputElement = null;
  private listSelectRef: DualListSelect = null;

  constructor(props: CreateRankProps) {
    super(props);

    const permissions = {};
    props.permissions.forEach((p) => {
      permissions[p.id] = <Tooltip content={p.description}>{p.name}</Tooltip>;
    });

    this.state = {
      permissions,
      requestActive: false,
      success: false,
      errors: null,
      name: '',
      level: 2,
    };
  }

  public render() {
    const ss = StyleSheet.create(defaultCreateRankStyle);
    const custom = StyleSheet.create(this.props.styles || {});
    return (
      <div className={css(ss.container, custom.container)}>

        <GroupTitle refetch={() => 0}>Create Rank</GroupTitle>

        <div className={css(ss.contentWrapper, custom.contentWrapper)}>
          {
              this.state.errors ? <p>{this.state.errors}!</p> : null
          }

          <Input label={'Name'} type='text' inputRef={r => this.nameInputRef = r}/>
          <Input
            label={'Level (2-1000)'}
            inputRef={r => this.levelInputRef = r}
            type='number'
            min={2}
            max={1000}
          />

          <DualListSelect items={this.state.permissions}
            styles={{
              container: {
                margin: '10px',
                height: '300px',
              },
            }}
            ref={r => this.listSelectRef = r}
            labelLeft={'Available permissions'}
            labelRight={'Permissions to assign'} />

          <div className={css(ss.buttons, custom.buttons)}>
            {this.createButton()}
            <FlatButton styles={{
              button: {
                margin: '10px',
                fontSize: '1.5em',
              },
            }}
            onClick={() => this.props.onCancel()}>Cancel</FlatButton>
          </div>
        </div>
      </div>
    );
  }

  private createRank = async () => {
    // const name = this.nameInputRef.value;
    // const level = Number.parseInt(this.levelInputRef.value);
    // const permisisons = this.listSelectRef.getRightKeys();

    // await this.setState({ requestActive: true });

    // const res = await webAPI.GroupsAPI.CreateRankV1(
    //   webAPI.defaultConfig,
    //   client.loginToken,
    //   client.shardID,
    //   client.characterID,
    //   this.props.groupId,
    //   name,
    //   level,
    //   permisisons,
    // );
    // if (res.ok) {
    //   this.setState({
    //     requestActive: false,
    //     success: true,
    //     errors: null,
    //   });
    //   setTimeout(() => this.props.onCreated(), 200);
    //   return;
    // }
    // this.setState({ requestActive: false, errors: res.data });

  }

  private createButton = () => {
    if (this.state.requestActive) {
      return <FlatButton styles={{
        button: {
          margin: '10px',
          fontSize: '1.5em',
        },
      }}><Spinner /></FlatButton>;
    }

    if (this.state.success) {
      return <FlatButton styles={{
        button: {
          margin: '10px',
          fontSize: '1.5em',
        },
      }}>Success!</FlatButton>;
    }

    return <FlatButton styles={{
      button: {
        margin: '10px',
        fontSize: '1.5em',
      },
    }}
                onClick={this.createRank}>Create</FlatButton>;
  }
}

export default CreateRankDialog;
