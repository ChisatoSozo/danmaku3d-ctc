import { Vector3 } from '@babylonjs/core';
import React from 'react';
import { Mesh } from '../engine/actors/Mesh';

export const Scene = () => {
    return (
        <>
            <Mesh name="land" modelName="forestA" />
            <hemisphericLight name="light1" intensity={0.7} direction={Vector3.Up()} />
        </>
    );
};
