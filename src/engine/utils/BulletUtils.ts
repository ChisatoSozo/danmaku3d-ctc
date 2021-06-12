import { Constants, RawTexture, Scene, Vector3 } from '@babylonjs/core';
import { BulletPattern } from '../types/BulletTypes';
import { MAX_BULLETS_PER_GROUP } from './Constants';
import { nextPowerOfTwo } from './Utils';

export const makeTextureFromVectors = (vectors: Vector3[], scene: Scene, w = 1, fill = -510) => {
    const num = vectors.length;
    const WIDTH = Math.max(nextPowerOfTwo(Math.ceil(Math.sqrt(num))), 2);
    const data = new Float32Array(WIDTH * WIDTH * 4);

    let offset = 0;

    vectors.forEach((vector, i) => {
        offset = i * 4;
        data[offset + 0] = vector.x;
        data[offset + 1] = vector.y;
        data[offset + 2] = vector.z;
        data[offset + 3] = w;
    });

    for (let i = offset / 4 + 1; i < WIDTH * WIDTH; i++) {
        offset = i * 4;
        data[offset + 0] = fill;
        data[offset + 1] = fill;
        data[offset + 2] = fill;
        data[offset + 3] = w;
    }

    return RawTexture.CreateRGBATexture(
        data,
        WIDTH,
        WIDTH,
        scene,
        false,
        false,
        Constants.TEXTURE_NEAREST_NEAREST,
        Constants.TEXTURETYPE_FLOAT,
    );
};

export const makeTextureFromArray = (array: number[], scene: Scene, fill = -510) => {
    const num = array.length;
    const WIDTH = Math.max(nextPowerOfTwo(Math.ceil(Math.sqrt(num))), 2);
    const data = new Float32Array(WIDTH * WIDTH * 4);

    let offset = 0;

    array.forEach((num, i) => {
        offset = i * 4;
        data[offset + 0] = fill;
        data[offset + 1] = fill;
        data[offset + 2] = fill;
        data[offset + 3] = num;
    });

    for (let i = offset / 4 + 1; i < WIDTH * WIDTH; i++) {
        offset = i * 4;
        data[offset + 0] = fill;
        data[offset + 1] = fill;
        data[offset + 2] = fill;
        data[offset + 3] = fill;
    }

    return RawTexture.CreateRGBATexture(
        data,
        WIDTH,
        WIDTH,
        scene,
        false,
        false,
        Constants.TEXTURE_NEAREST_NEAREST,
        Constants.TEXTURETYPE_FLOAT,
    );
};

export const makeTextureFromBlank = (num: number, scene: Scene, w = 1, fill = -510, blankFill = 0) => {
    const WIDTH = Math.max(nextPowerOfTwo(Math.ceil(Math.sqrt(num))), 2);
    const data = new Float32Array(WIDTH * WIDTH * 4);

    let offset = 0;

    for (let i = 0; i < num; i++) {
        offset = i * 4;
        data[offset + 0] = blankFill;
        data[offset + 1] = blankFill;
        data[offset + 2] = blankFill;
        data[offset + 3] = w;
    }

    for (let i = offset / 4 + 1; i < WIDTH * WIDTH; i++) {
        offset = i * 4;
        data[offset + 0] = fill;
        data[offset + 1] = fill;
        data[offset + 2] = fill;
        data[offset + 3] = w;
    }

    return RawTexture.CreateRGBATexture(
        data,
        WIDTH,
        WIDTH,
        scene,
        false,
        false,
        Constants.TEXTURE_NEAREST_NEAREST,
        Constants.TEXTURETYPE_FLOAT,
    );
};

export const computeSourceTextures = (pattern: BulletPattern, scene: Scene) => {
    return {
        initialPositions: makeTextureFromVectors(pattern.positions as Vector3[], scene, 1, -510),
        initialVelocities: makeTextureFromVectors(pattern.positions as Vector3[], scene, 1, 0),
        timings: makeTextureFromArray(pattern.timings, scene),
        positions: makeTextureFromBlank(pattern.timings.length, scene, 1, -510, -510),
        velocities: makeTextureFromBlank(pattern.timings.length, scene, 0, 0, 0),
        collisions: makeTextureFromBlank(pattern.timings.length, scene, 0, 0), //No collisions
    };
};

export const convertPlayerBulletCollisions = (buffer: ArrayBufferView) => {
    const collisions = [];

    if (!(buffer instanceof Float32Array)) throw new Error('buffer must be Float32Array');

    for (let i = 0; i < buffer.length; i += 4) {
        const collisionID = buffer[i + 3];
        if (collisionID !== 0) {
            collisions.push({
                hit: new Vector3(buffer[i], buffer[i + 1], buffer[i + 2]),
                collisionID: collisionID,
            });
        }
    }

    return collisions;
};

export const convertEnemyBulletCollisions = (buffer: ArrayBufferView) => {
    const collisions = [];

    if (!(buffer instanceof Float32Array)) throw new Error('buffer must be Float32Array');

    for (let i = 0; i < buffer.length; i += 4) {
        const pointGraze = buffer[i];
        const bombLife = buffer[i + 1];
        const powerSpecial = buffer[i + 2];

        const environmentPlayer = buffer[i + 3];
        const player = Math.floor(environmentPlayer / MAX_BULLETS_PER_GROUP);
        if (pointGraze || bombLife || powerSpecial || player) {
            collisions.push({
                player,
                point: pointGraze % MAX_BULLETS_PER_GROUP,
                graze: Math.floor(pointGraze / MAX_BULLETS_PER_GROUP),
                bomb: bombLife % 1000,
                life: Math.floor(bombLife / 1000),
                power: powerSpecial % 1000,
                Special: Math.floor(powerSpecial / 1000),
            });
        }
    }

    return collisions;
};
