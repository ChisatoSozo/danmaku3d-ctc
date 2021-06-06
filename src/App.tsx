import React from 'react';
import { Danmaku3D } from './engine/Danmaku3D';
import { Scene } from './stages/Scene';

function App() {
    return (
        <Danmaku3D assetPaths={[`${process.env.PUBLIC_URL}/assets/stage1/forestA.glb`]} xrEnabled>
            <Scene />
        </Danmaku3D>
    );
}

export default App;
