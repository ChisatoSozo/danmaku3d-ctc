import { Color3, Color4, Scene } from '@babylonjs/core';
import { useEffect } from 'react';
import { useScene } from 'react-babylonjs';

export const useEnvironmentColor = (color?: Color3) => {
    const scene = useScene();
    useEffect(() => {
        if (!scene || !color) return;
        const _color = new Color4(color.r, color.g, color.b, 1.0);
        scene.clearColor = _color;
        scene.fogColor = color;
    }, [scene, color]);
    return null;
};

export const setEnvironmentColor = (scene: Scene, color = new Color3(0.1, 0.1, 0.2)) => {
    const _color = new Color4(color.r, color.g, color.b, 1.0);
    scene.clearColor = _color;
    scene.fogColor = color;
};
