import { Color3, Scene } from '@babylonjs/core';
import { useEffect } from 'react';
import { useScene } from 'react-babylonjs';

interface GameSetupProps {
    clearColor: Color3;
}

export const GameSetup: React.FC<GameSetupProps> = ({ clearColor }) => {
    const scene = useScene();

    useEffect(() => {
        if (!scene) return;
        scene.fogMode = Scene.FOGMODE_LINEAR;
        scene.fogStart = 20.0;
        scene.fogEnd = 60.0;
        scene.fogColor = clearColor;
    }, [clearColor, scene]);

    return null;
};
