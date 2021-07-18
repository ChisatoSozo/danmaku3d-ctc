import { Color3, Vector3 } from '@babylonjs/core';
import React, { useMemo, useState } from 'react';
import { useScene } from 'react-babylonjs';
import { Mesh } from '../engine/actors/Mesh';
import { Particles } from '../engine/actors/Particles';
import { setEnvironmentColor } from '../engine/hooks/useEnvironmentColor';
import { useKeydown } from '../engine/hooks/useKeydown';
import { setRenderDistance } from '../engine/hooks/useRenderDistance';
import { SceneDef } from './SceneDef';

interface StageProps {
    state: string;
}

export const Scene: React.FC<StageProps> = () => {
    const [stageState, setStageState] = useState('blossom');
    const scene = useScene();

    const [epochIndex, setEpochIndex] = useState(0);
    const stageSource = useMemo(() => SceneDef(), []);

    useKeydown('BOMB', () => {
        if (stageState === 'blossom') {
            setStageState('rainPre');
            if (scene) setEnvironmentColor(scene, new Color3(0, 0, 0));
            if (scene) setRenderDistance(scene, 0);
        }
        if (stageState === 'rainPre') {
            setStageState('rain');
            if (scene) setEnvironmentColor(scene);
            if (scene) setRenderDistance(scene);
        }
        if (stageState === 'rain') {
            setStageState('rainSlow');
        }
        if (stageState === 'rainSlow') {
            setStageState('blossomFast');
        }
        if (stageState === 'blossomFast') {
            setStageState('main');
        }
    });

    const state = stageState;

    return (
        <>
            <Mesh name="land" modelName="forestA" />
            <hemisphericLight name="light1" intensity={0.7} direction={Vector3.Up()} />
            {(state === 'blossom' || state === 'blossomFast') && (
                <Particles
                    name="cherryBlossom1"
                    speed={state === 'blossomFast' ? 4 : 1}
                    position={new Vector3(0, 0, 0)}
                    particleSystemName="cherryBlossomParticles"
                />
            )}
            {(state === 'blossom' || state === 'blossomFast') && (
                <Particles
                    name="cherryBlossom2"
                    speed={state === 'blossomFast' ? 4 : 1}
                    position={new Vector3(0, 0, 0)}
                    particleSystemName="cherryBlossomParticles2"
                />
            )}
            {(state === 'rain' || state === 'rainSlow') && (
                <Particles
                    name="rain"
                    speed={state === 'rainSlow' ? 0.1 : 1}
                    position={new Vector3(0, 30, 0)}
                    particleSystemName="rainParticles"
                />
            )}
            {/* <TestActor /> */}
        </>
    );
};
