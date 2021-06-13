import { GlowLayer as GlowLayerType } from '@babylonjs/core';
import React, { useMemo } from 'react';
import { useScene } from 'react-babylonjs';
import { GlowLayer } from '../forks/GlowLayer';

export interface IGlowContext {
    glowLayer?: GlowLayerType;
}

export const GlowContext = React.createContext<IGlowContext>({});

export const useGlowContext = () => {
    const scene = useScene();
    const glowLayer = useMemo(() => {
        const glowLayer = new GlowLayer('glow', scene, {});
        glowLayer.intensity = 0.4;
        return glowLayer as unknown as GlowLayerType;
    }, [scene]);
    return { glowLayer };
};
