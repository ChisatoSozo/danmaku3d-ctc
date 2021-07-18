import { Scene } from '@babylonjs/core';
import { useEffect } from 'react';
import { useScene } from 'react-babylonjs';

export const useRenderDistance = (distance: number, fade = 40) => {
    const scene = useScene();
    useEffect(() => {
        if (!scene) return;
        scene.fogStart = Math.min(distance - fade, 0);
        scene.fogEnd = distance;
    }, [scene, distance, fade]);
    return null;
};

export const setRenderDistance = (scene: Scene, distance = 100, fade = 20) => {
    scene.fogStart = Math.min(distance - fade, 0);
    scene.fogEnd = distance;
};
