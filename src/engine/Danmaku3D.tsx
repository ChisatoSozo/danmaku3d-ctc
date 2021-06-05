import { Color3, Color4 } from '@babylonjs/core';
import '@babylonjs/loaders';
import React, { useMemo } from 'react';
import { Scene } from 'react-babylonjs';
import { GeneralContainer } from './containers/GeneralContainer';
import Engine from './forks/Engine';
import { useWindowSize } from './hooks/useWindowSize';
import { PlayerCamera } from './player/PlayerCamera';

interface Danmaku3DProps {
    clearColor?: Color3;
    assetPaths?: string[];
}

export const Danmaku3D: React.FC<Danmaku3DProps> = ({ children, clearColor = new Color3(0.1, 0.1, 0.2), assetPaths = [] }) => {
    const windowSize = useWindowSize();
    const _clearColor = useMemo(() => new Color4(clearColor.r, clearColor.g, clearColor.b, 1.0), [clearColor]);

    return (
        <Engine width={windowSize.width} height={windowSize.height} antialias canvasId="babylonJS">
            <Scene clearColor={_clearColor}>
                <GeneralContainer assetPaths={assetPaths}>
                    <PlayerCamera />
                    {children}
                </GeneralContainer>
            </Scene>
        </Engine>
    );
};
