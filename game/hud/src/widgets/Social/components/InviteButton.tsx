/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import * as React from 'react';
import { StyleSheet, css, StyleDeclaration } from 'aphrodite';
import {
  webAPI,
  Spinner,
  RaisedButton,
  Input,
  client,
  jsKeyCodes,
  Tooltip,
} from '@csegames/camelot-unchained';

export interface InviteButtonStyle extends StyleDeclaration {
  button: React.CSSProperties;
  inputVisible: React.CSSProperties;
  inputHidden: React.CSSProperties;
  container: React.CSSProperties;
  error: React.CSSProperties;
  status: React.CSSProperties;
}

export const defaultInviteButtonStyle: InviteButtonStyle = {

  container: {
  },

  button: {
    flex: '0 0 auto',
    display: 'flex',
    alignContent: 'center',
    alignItems: 'center',
    justifyContent: 'center',
  },

  status: {
    fontSize: '0.9em',
  },

  inputVisible: {
    display: 'flex',
    maxWidth: '99999px',
  },

  inputHidden: {
    maxWidth: '0px',
  },

  error: {

  },

};

export interface InviteButtonProps {
  dispatch: (action: any) => void;
  refetch: () => void;
  groupId: string;
  styles?: Partial<InviteButtonStyle>;
}

export interface InviteButtonState {
  showInput: boolean;
  inviting: boolean;
  error: string;
  status: string;
}

export class InviteButton extends React.Component<InviteButtonProps, InviteButtonState> {

  private inputRef: HTMLInputElement = null;

  constructor(props: InviteButtonProps) {
    super(props);
    this.state = {
      showInput: false,
      inviting: false,
      error: null,
      status: null,
    };
  }

  public render() {
    const ss = StyleSheet.create(defaultInviteButtonStyle);
    const custom = StyleSheet.create(this.props.styles || {});

    return (
      <div className={css(ss.container, custom.container)}>
        {
            this.state.error ?
            (
              <div className={css(ss.error, custom.error)}>
                <Tooltip content={() => <span>{this.state.error}</span>}>
                  <i className='fa fa-exclamation-circle'></i> Save failed.
                </Tooltip>
              </div>
            ) : null
          }
          {
            this.state.status ?
            (
              <div className={css(ss.status, custom.status)}>
                <Tooltip content={() => <span>{this.state.status}</span>}>
                  <i className='fa fa-info-circle'></i> success!
                </Tooltip>
              </div>
            ) : null
          }

        <div style={{ display: 'flex' }}>
        <Input
          inputRef={r => this.inputRef = r}
          placeholder={'Enter name & hit enter'}
          onKeyDown={this.onKeyDown}
        />

          <RaisedButton onClick={this.toggleInputVisibilty}>
            {this.state.inviting ? <Spinner /> : this.state.showInput ?
              <i className='fa fa-minus'></i> : <i className='fa fa-plus'></i>}
          </RaisedButton>
        </div>
      </div>
    );
  }

  private toggleInputVisibilty = () => {
    if (this.inputRef && !this.state.showInput) this.inputRef.focus();
    this.setState({
      showInput: !this.state.showInput,
    });
  }

  private doInvite = async () => {
    if (this.inputRef == null) return;
    await this.setState({ inviting: true, error: null });

    const name = this.inputRef.value;
    const res = await webAPI.GroupsAPI.InviteV1(
      webAPI.defaultConfig,
      client.loginToken,
      client.shardID,
      client.characterID,
      this.props.groupId,
      null,
      name,
    );

    if (res.ok) {
      this.setState({
        inviting: false,
        showInput: false,
        error: null,
        status: `${name} as been invited!`,
      });
      this.props.refetch();
      return;
    }

    this.setState({
      inviting: false,
      error: res.data,
    });
  }

  private onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.keyCode === jsKeyCodes.ENTER) {
      this.doInvite();
      e.stopPropagation();
    }

    if (e.keyCode === jsKeyCodes.ESC) {
      this.toggleInputVisibilty();
      e.stopPropagation();
    }
  }
}

export default InviteButton;
