import React from 'react';
import { AssetContext, useAssetContext } from './AssetContext';
import { BulletContext, useBulletContext } from './BulletContext';
import { ControlsContext, useControlsContext } from './ControlsContext';
import { useLS } from './LSContainer';
import { useXRContext, XRContext } from './XRContext';

interface GameContainerProps {
    assetPaths: string[];
    xrEnabled: boolean;
}

export const GameContainer: React.FC<GameContainerProps> = ({ children, assetPaths, xrEnabled }) => {
    const assets = useAssetContext(assetPaths);
    const bullets = useBulletContext();
    const controls = useControlsContext(false);
    const xr = useXRContext(xrEnabled);
    useLS();

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
