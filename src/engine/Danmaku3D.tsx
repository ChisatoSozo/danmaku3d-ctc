import { Color3, Color4 } from '@babylonjs/core';
import '@babylonjs/loaders';
import React, { useMemo } from 'react';
import { Scene } from 'react-babylonjs';
import { GameContainer } from './containers/GameContainer';
import Engine from './forks/Engine';
import { GameSetup } from './GameSetup';
import { useWindowSize } from './hooks/useWindowSize';
import { BindControls } from './player/BindControls';
import { Player } from './player/Player';
import { PlayerType } from './player/PlayerTypes';
import './utils/styles.css';

interface Danmaku3DProps {
    players: PlayerType[];
    clearColor?: Color3;
    assetPaths?: string[];
    xrEnabled?: boolean;
}

export const Danmaku3D: React.FC<Danmaku3DProps> = ({
    children,
    players,
    clearColor = new Color3(0.1, 0.1, 0.2),
    assetPaths = [],
    xrEnabled = false,
}) => {
    const windowSize = useWindowSize();
    const _clearColor = useMemo(() => new Color4(clearColor.r, clearColor.g, clearColor.b, 1.0), [clearColor]);

    const selectedPlayer = players[0];

    return (
        <Engine width={windowSize.width} height={windowSize.height} antialias canvasId="babylonJS">
            <Scene clearColor={_clearColor}>
                <GameSetup clearColor={clearColor} />
                <GameContainer assetPaths={assetPaths} xrEnabled={xrEnabled}>
                    <Player selectedPlayer={selectedPlayer} />
                    <BindControls />
                    {children}
                </GameContainer>
            </Scene>
        </Engine>
    );
};
