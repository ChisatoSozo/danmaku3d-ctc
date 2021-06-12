import { AbstractMesh, Nullable, Vector3 } from '@babylonjs/core';
import React, { useCallback } from 'react';
import MultiSound from '../sounds/MultiSound';
import { Assets } from './AssetContext';

export const makeParticleSystem = (assets: Assets, particleSystemName: string, emitter: Nullable<AbstractMesh | Vector3>) => {
    const particleSystem = assets.particles[particleSystemName];
    if (!particleSystem) throw new Error("Couldn't find particle system " + particleSystemName);
    particleSystem.emitter = emitter;

    return particleSystem;
};

const effectSoundMap: {
    [key: string]: MultiSound;
} = {};
const effectPlayingMap: {
    [key: string]: number;
} = {};

interface EffectOptions {
    type: 'particles';
    name: string;
    duration?: number;
}

export interface IEffectContext {
    addEffect: (emitter: Nullable<AbstractMesh | Vector3>, effectOptions: EffectOptions) => void;
}
const defaultEffectContext: IEffectContext = {
    addEffect: () => {
        return;
    },
};

export const EffectContext = React.createContext<IEffectContext>(defaultEffectContext);

export const useEffectContext = (assets: Assets) => {
    const addEffect = useCallback(
        (emitter, effectOptions) => {
            switch (effectOptions.type) {
                case 'particles': {
                    const particleSystem = makeParticleSystem(assets, effectOptions.name + 'Particles', emitter);

                    if (!effectPlayingMap[effectOptions.name]) effectPlayingMap[effectOptions.name] = 0;
                    effectPlayingMap[effectOptions.name]++;

                    const sound = effectSoundMap[effectOptions.name];
                    if (sound) sound.play();

                    window.setTimeout(() => {
                        effectPlayingMap[effectOptions.name]--;
                        if (effectPlayingMap[effectOptions.name] === 0) particleSystem.stop();
                    }, effectOptions.duration || 100);
                    break;
                }
                default:
                    throw new Error('Unknown effect type' + effectOptions.type);
            }
        },
        [assets],
    );

    return { addEffect };
};
