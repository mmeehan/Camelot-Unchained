/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 *
 */

import * as React from 'react';
import styled from 'react-emotion';
import { PlayerState } from '@csegames/camelot-unchained';

import { isEqualPlayerState } from '../../../lib/playerStateEqual';
import { BodyParts } from '../../../lib/PlayerStatus';
import { getBloodPercent, getStaminaPercent, getFaction } from '../lib/healthFunctions';
import ClassIndicator from './ClassIndicator';
import SmallBar from './SmallBar';
import BigBar from './BigBar';

const Container = styled('div')`
  position: relative;
  height: ${({ scale }: {scale: number}) => 242 * scale}px;
  width: ${({ scale }: {scale: number}) => 392 * scale}px;
  -webkit-animation: ${(props: any) => props.shouldShake ? 'shake-hard 0.15s forwards' : ''}
  animation: ${(props: any) => props.shouldShake ? 'shake-hard 0.15s forwards' : ''}
  filter: ${(props: any) => props.isAlive ? 'grayscale(0%)' : 'grayscale(100%)'};
  -webkit-filter: ${(props: any) => props.isAlive ? 'grayscale(0%)' : 'grayscale(100%)'};
`;

const NameContainer = styled('div')`
  position: absolute;
  top: ${({ scale }: {scale: number}) => 7 * scale}px;
  left: ${({ scale }: {scale: number}) => 155 * scale}px;
  display: flex;
  align-items: center;
  height: ${({ scale }: {scale: number}) => 64 * scale}px;
  width: ${({ scale }: {scale: number}) => 404 * scale}px;
  background: url(images/healthbar/mini/name-bg.png) no-repeat;
  background-size: contain;
`;

const Name = styled('div')`
  color: white;
  max-width: ${({ scale }: {scale: number}) => 375 * scale}px;
  font-size: ${({ scale }: {scale: number}) => 32 * scale}px;
  line-height: ${({ scale }: {scale: number}) => 32 * scale}px;
  margin-left: ${({ scale }: {scale: number}) => 50 * scale}px;
  overflow: hidden;
  word-wrap: break-word;
`;

const ContainerOverlay = styled('div')`
  position: absolute;
  background: url(images/healthbar/mini/main_frame_compact.png);
  background-size: contain;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
`;

const BloodBall = styled('div')`
  position: absolute;
  left: ${({ scale }: {scale: number}) => 25 * scale}px;
  bottom: ${({ scale }: {scale: number}) => 20 * scale}px;
  width: ${({ scale }: {scale: number}) => 85 * scale}px;
  height: ${({ scale }: {scale: number}) => 85 * scale}px;
  border-radius: ${({ scale }: {scale: number}) => 42.5 * scale}px;
  background: #440000;

  &:after {
    content: '';
    position: absolute;
    width: 100%;
    height: 100%;
    border-radius: ${({ scale }: {scale: number}) => 52.5 * scale}px;
    background: #E30000;
    -webkit-mask-image: linear-gradient(to top, black ${(props: any) => props.percent}%,
      transparent ${(props: any) => props.percent}%);
    -webkit-mask-size: 100% 100%;
  }
`;

// const BloodCount = styled('div')`
//   position: absolute;
//   left: 10px;
//   bottom: -20px;
//   display: flex;
//   align-items: center;
//   justify-content: center;
//   color: white;
//   width: 61px;
//   height: 18px;
//   background: url(images/healthbar/mini/blood_number.png);
//   z-index: 10;
// `;

const HealthBars = styled('div')`
  position: absolute;
  top: ${({ scale }: {scale: number}) => 74 * scale}px;
  left: ${({ scale }: {scale: number}) => 118 * scale}px;
  display: flex:
  flex-direction: column;
`;

const SmallHealthPillsContainer = styled('div')`
  position: relative;
  left: ${({ scale }: {scale: number}) => 5 * scale}px;
  width: ${({ scale }: {scale: number}) => 253 * scale}px;
`;

const BigHealthPillsContainer = styled('div')`
  width: ${({ scale }: {scale: number}) => 264 * scale}px;
`;

const StaminaBar = styled('div')`
  position: relative;
  width: 103%;
  height: ${({ scale }: {scale: number}) => 15 * scale}px;
  left: ${({ scale }: {scale: number}) => -15 * scale}px;
  background: linear-gradient(to top, #303030, #1D1D1D);
  -webkit-mask-image: url(images/healthbar/regular/stamina_mask.png);
  -webkit-mask-size: 100% 100%;

  &:after {
    content: '';
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    width: ${(props: any) => props.percent}%;
    transition: width 0.1s;
    -webkit-transition: width 0.1s;
    height: 100%;
    background: linear-gradient(to top, #C2FFC8, #4CB856);
  }
`;

export interface HealthBarViewProps {
  shouldShake: boolean;
  playerState: PlayerState;
}

export interface HealthBarViewState {

}

class HealthBarView extends React.PureComponent<HealthBarViewProps, HealthBarViewState> {
  public render() {
    const { playerState } = this.props;
    const bloodPercent = getBloodPercent(playerState);
    const staminaPercent = getStaminaPercent(playerState);
    const faction = getFaction(playerState);
    const scale = 0.33;
    return (
      <Container shouldShake={this.props.shouldShake} isAlive={playerState.isAlive} scale={scale}>
        <NameContainer scale={scale}>
          <Name scale={scale}>{playerState.name}</Name>
        </NameContainer>
        <ClassIndicator scale={scale} top={15 * scale} left={115 * scale} width={55 * scale}
          height={55 * scale} borderRadius={27.5 * scale} faction={faction} />
        <BloodBall percent={bloodPercent} scale={scale}>
          {/* <BloodCount>{this.props.currentBlood}</BloodCount> */}
        </BloodBall>
        <HealthBars scale={scale}>
          <SmallHealthPillsContainer scale={scale}>
            <SmallBar height={14 * scale} scale={scale} bodyPart={BodyParts.RightArm} playerState={playerState} />
            <SmallBar height={14 * scale} scale={scale} bodyPart={BodyParts.LeftArm} playerState={playerState} />
          </SmallHealthPillsContainer>
          <BigHealthPillsContainer scale={scale}>
            <BigBar left={0} height={35 * scale} scale={scale} bodyPart={BodyParts.Head} playerState={playerState} />
            <BigBar left={0} height={35 * scale} scale={scale} bodyPart={BodyParts.Torso} playerState={playerState} />
          </BigHealthPillsContainer>
          <SmallHealthPillsContainer scale={scale}>
            <SmallBar height={14 * scale} scale={scale} bodyPart={BodyParts.RightLeg} playerState={playerState} />
            <SmallBar height={14 * scale} scale={scale} bodyPart={BodyParts.LeftLeg} playerState={playerState} />
          </SmallHealthPillsContainer>
          <StaminaBar percent={staminaPercent} scale={scale}/>
        </HealthBars>
        <ContainerOverlay />
      </Container>
    );
  }

  public shouldComponentUpdate(nextProps: HealthBarViewProps, nextState: HealthBarViewState) {
    return !isEqualPlayerState(nextProps.playerState, this.props.playerState);
  }
}

export default HealthBarView;
