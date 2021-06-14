import React from 'react';
import { Danmaku3D } from './engine/Danmaku3D';
import { PlayerType } from './engine/player/PlayerTypes';
import { EmitterMesh } from './players/marisa/EmitterMesh';
import { Scene } from './stages/Scene';

const assetPaths = [
    `${process.env.PUBLIC_URL}/assets/players/marisa/rune1.png`,
    `${process.env.PUBLIC_URL}/assets/stage1/forestA.glb`,
];

function App() {
    const players: PlayerType[] = [
        {
            name: 'Marisa',
            emitter: {
                MeshComponent: EmitterMesh,
            },
        },
    ];

    return (
        <Danmaku3D players={players} assetPaths={assetPaths}>
            <Scene />
        </Danmaku3D>
    );
}

export default App;
