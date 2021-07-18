import { AbstractMesh, ParticleSystem, TransformNode } from '@babylonjs/core';
import { useEffect, useState } from 'react';
import { makeParticleSystem } from '../effects/makeParticleSystem';
import { useAssets } from './useAssets';

export const useParticleSystem = (
    transformNodeRef: React.MutableRefObject<TransformNode | undefined>,
    particleSystemName: string,
) => {
    const assets = useAssets();
    const [particles, setParticles] = useState<ParticleSystem>();

    useEffect(() => {
        if (!transformNodeRef.current || !assets.particles[particleSystemName]) return;
        const particles = makeParticleSystem(assets, particleSystemName, transformNodeRef.current as unknown as AbstractMesh);
        particles.start();
        setParticles(particles);

        return () => {
            particles.stop();
            setParticles(undefined);
        };
    }, [assets, particleSystemName, transformNodeRef]);

    return particles;
};
