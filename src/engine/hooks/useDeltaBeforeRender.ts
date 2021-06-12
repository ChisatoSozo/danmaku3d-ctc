import { Scene } from '@babylonjs/core';
import { useBeforeRender } from 'react-babylonjs';

interface PausableScene extends Scene {
    paused: boolean | undefined;
}

type BeforeRenderFunc = (scene: PausableScene, deltaS: number) => void;

export const useDeltaBeforeRender = (callback: BeforeRenderFunc) => {
    useBeforeRender((scene) => {
        const pausableScene = scene as PausableScene;
        const deltaS = pausableScene.paused ? 0 : scene.getEngine().getDeltaTime() / 1000;
        callback(pausableScene, deltaS);
    });
};
