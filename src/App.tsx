import { Vector3 } from '@babylonjs/core';
import React from 'react';
import { Mesh } from './engine/actors/Mesh';
import { Danmaku3D } from './engine/Danmaku3D';

function App() {
    return (
        <Danmaku3D assetPaths={[`${process.env.PUBLIC_URL}/assets/stage1/forestA.glb`]}>
            <Mesh name="land" modelName="forestA" />
            <hemisphericLight name="light1" intensity={0.7} direction={Vector3.Up()} />
        </Danmaku3D>
    );
}

export default App;
