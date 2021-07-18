import { AbstractMesh, TransformNode } from '@babylonjs/core';
import React, { useEffect, useRef } from 'react';
import { useParticleSystem } from '../hooks/useParticleSystem';
import { TransformNodeProps } from '../types/simplified-react-babylon-js';

interface ParticlesProps extends TransformNodeProps {
    particleSystemName: string;
    speed?: number;
}

export const Particles: React.FC<ParticlesProps> = ({ particleSystemName, speed, ...props }) => {
    const transformNodeRef = useRef<TransformNode>();
    const particles = useParticleSystem(
        transformNodeRef as unknown as React.MutableRefObject<AbstractMesh | undefined>,
        particleSystemName,
    );

    useEffect(() => {
        if (!particles || !speed) return;
        particles.direction1.scaleInPlace(speed);
        particles.direction2.scaleInPlace(speed);
        particles.emitRate *= speed;
        particles.maxLifeTime /= speed;
        particles.minLifeTime /= speed;
        particles.particles.forEach((particle) => {
            particle.direction.scaleInPlace(speed);
            particle.lifeTime /= speed;
        });
    }, [particles, speed]);

    useEffect(() => {
        return () => {
            particles?.particles.forEach((particle) => {
                particle.lifeTime = 0;
            });
        };
    }, [particles]);

    return <transformNode ref={transformNodeRef} {...props} />;
};
