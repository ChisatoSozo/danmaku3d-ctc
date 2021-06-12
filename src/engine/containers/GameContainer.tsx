import { Vector3 } from '@babylonjs/core';
import React from 'react';
import { useResolveFloatTextureReadPixels } from '../hooks/useResolveFloatTextureReadPixels';
import { AssetContext, useAssetContext } from './AssetContext';
import { BulletContext, useBulletContext } from './BulletContext';
import { ControlsContext, useControlsContext } from './ControlsContext';
import { useLS } from './LSContainer';
import { useXRContext, XRContext } from './XRContext';

interface GameContainerProps {
    assetPaths: string[];
    xrEnabled: boolean;
}

const environmentCollision = new Vector3(1, 0, 0);

export const GameContainer: React.FC<GameContainerProps> = ({ children, assetPaths, xrEnabled }) => {
    const assets = useAssetContext(assetPaths);
    const bullets = useBulletContext(assets, environmentCollision);
    const controls = useControlsContext(false);
    const xr = useXRContext(xrEnabled);
    useLS();

    //Engine stuff
    useResolveFloatTextureReadPixels();

    return (
        <AssetContext.Provider value={assets}>
            <BulletContext.Provider value={bullets}>
                <ControlsContext.Provider value={controls}>
                    <XRContext.Provider value={xr}>{children}</XRContext.Provider>
                </ControlsContext.Provider>
            </BulletContext.Provider>
        </AssetContext.Provider>
    );
};
