import { Vector3 } from '@babylonjs/core';
import React from 'react';
import { PlayerBulletEmitter } from './PlayerBulletEmitter';
import { PlayerCamera } from './PlayerCamera';
import { PlayerMovement } from './PlayerMovement';
import { PlayerType } from './PlayerTypes';

interface PlayerProps {
    selectedPlayer: PlayerType;
}

const emitterPosition = new Vector3(0, 0, 1);
export const Player: React.FC<PlayerProps> = ({ selectedPlayer }) => {
    return (
        <PlayerMovement>
            <PlayerCamera />
            <transformNode name="emitterTransform" position={emitterPosition}>
                <PlayerBulletEmitter MeshComponent={selectedPlayer.emitter.MeshComponent} side="left" />
                <PlayerBulletEmitter MeshComponent={selectedPlayer.emitter.MeshComponent} side="right" />
            </transformNode>
        </PlayerMovement>
    );
};
