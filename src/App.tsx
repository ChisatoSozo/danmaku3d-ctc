import React from 'react';
import { Danmaku3D } from './engine/Danmaku3D';
import { PlayerType } from './engine/player/PlayerTypes';
import Music from './engine/sounds/Music';
import { EmitterMesh } from './players/marisa/EmitterMesh';
import { Scene } from './stages/Scene';

const assetPaths = [
    `${process.env.PUBLIC_URL}/assets/players/marisa/rune1.png`,
    `${process.env.PUBLIC_URL}/assets/stage1/forestA.glb`,
    `${process.env.PUBLIC_URL}/assets/particles/cherryBlossomParticles.particles`,
    `${process.env.PUBLIC_URL}/assets/particles/cherryBlossomParticles2.particles`,
    `${process.env.PUBLIC_URL}/assets/particles/rainParticles.particles`,
];

Music.registerBGM('reimuTheme1', 'thC31');

function App() {
    const players: PlayerType[] = [
        {
            name: 'Marisa',
            emitter: {
                MeshComponent: EmitterMesh,
            },
        },
    ];

    Music.play('reimuTheme1');

    return (
        <Danmaku3D players={players} assetPaths={assetPaths}>
            <Scene state={''} />
        </Danmaku3D>
    );
}

export default App;
