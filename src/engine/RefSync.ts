import { TransformNode, Vector3 } from '@babylonjs/core';
import { times } from 'lodash';
import { MAX_BOMBS, MAX_ENEMIES } from './utils/Constants';

interface GlobalEnemy {
    position: Vector3;
    health: number;
    radius: number;
    onDeath: () => void;
    dead: boolean;
}

interface GlobalBomb {
    position: Vector3;
    radius: number;
    dead: boolean;
}

export const makeEnemyDefaultVals = () => ({
    position: new Vector3(-510, -510, -510),
    health: -510,
    radius: 0,
    onDeath: () => {
        return;
    },
    dead: true,
});

export const makeDefaultBomb = () => ({
    position: new Vector3(-510, -510, -510),
    radius: 0,
    dead: true,
});

interface GlobalActorRefs {
    player:
        | TransformNode
        | {
              position: Vector3;
          };
    enemies: GlobalEnemy[];
    bombs: GlobalBomb[];
    bombPositionBuffer: number[];
    bombRadiiBuffer: number[];
    enemyPositionBuffer: number[];
    enemyRadiiBuffer: number[];
    enemyIndex: number;
}

export const globalActorRefs: GlobalActorRefs = {
    player: {
        position: new Vector3(0, 0, 0),
    },
    enemies: times(MAX_ENEMIES, makeEnemyDefaultVals),
    bombs: times(MAX_BOMBS, makeDefaultBomb),
    bombPositionBuffer: times(MAX_BOMBS * 3, () => -510),
    bombRadiiBuffer: times(MAX_BOMBS, () => 0),
    enemyPositionBuffer: times(MAX_ENEMIES * 3, () => -510),
    enemyRadiiBuffer: times(MAX_ENEMIES, () => 0),
    enemyIndex: 0,
};
