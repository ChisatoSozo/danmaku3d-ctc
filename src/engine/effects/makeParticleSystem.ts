import { AbstractMesh } from '@babylonjs/core';
import { Assets } from '../containers/AssetContext';

export const makeParticleSystem = (assets: Assets, particleSystemName: string, emitter: AbstractMesh) => {
    const particleSystem = assets.particles[particleSystemName];
    if (!particleSystem) throw new Error("Couldn't find particle system " + particleSystemName);
    particleSystem.emitter = emitter;

    return particleSystem;
};
