import { Vector3 } from '@babylonjs/core';
import React from 'react';
import { useResolveFloatTextureReadPixels } from '../hooks/useResolveFloatTextureReadPixels';
import { AssetContext, useAssetContext } from './AssetContext';
import { BulletContext, useBulletContext } from './BulletContext';
import { ControlsContext, useControlsContext } from './ControlsContext';
import { EffectContext, useEffectContext } from './EffectContext';
import { GlowContext, useGlowContext } from './GlowContext';
import { useLS } from './LSContext';
import { UIContext, useUIContext } from './UIContext';
import { useXRContext, XRContext } from './XRContext';

interface GameContainerProps {
    assetPaths: string[];
    xrEnabled: boolean;
}

const environmentCollision = new Vector3(1, 0, 0);

export const GameContainer: React.FC<GameContainerProps> = ({ children, assetPaths, xrEnabled }) => {
    const glow = useGlowContext();
    const assets = useAssetContext(assetPaths);
    const effects = useEffectContext(assets.assets);
    const bullets = useBulletContext(assets, effects, glow.glowLayer, environmentCollision);
    const controls = useControlsContext(false);
    const xr = useXRContext(xrEnabled);
    const ui = useUIContext();

    useLS();

    //Engine stuff
    useResolveFloatTextureReadPixels();

    return (
        <AssetContext.Provider value={assets}>
            <BulletContext.Provider value={bullets}>
                <ControlsContext.Provider value={controls}>
                    <EffectContext.Provider value={effects}>
                        <GlowContext.Provider value={glow}>
                            <XRContext.Provider value={xr}>
                                <UIContext.Provider value={ui}>{children}</UIContext.Provider>
                            </XRContext.Provider>
                        </GlowContext.Provider>
                    </EffectContext.Provider>
                </ControlsContext.Provider>
            </BulletContext.Provider>
        </AssetContext.Provider>
    );
};
