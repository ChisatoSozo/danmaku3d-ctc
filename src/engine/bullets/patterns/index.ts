import { Scene, Texture, Vector3 } from '@babylonjs/core';
import { BulletCache, BulletPattern, PatternOptions } from '../../types/BulletTypes';
import { RandVector3 } from '../../utils/BabylonUtils';
import { computeSourceTextures } from '../../utils/BulletUtils';
import { capFirst } from '../../utils/Utils';
import { makeBurstPattern } from './BurstPattern';

export type MakePattern = (patternOptions: PatternOptions) => {
    positions: Vector3[];
    velocities: Vector3[];
    timings?: number[];
};

const patternMap: {
    [patternName: string]: MakePattern;
} = {
    makeBurstPattern,
};

type MakeBulletPattern = (
    patternOptions: PatternOptions,
    cache: BulletCache,
    scene: Scene,
    firstCompute?: boolean,
) => BulletPattern;

export const makeBulletPattern: MakeBulletPattern = (patternOptions, cache, scene, firstCompute = false) => {
    const uid = patternOptions.uid;
    const precomputedBulletPattern = cache.patterns[patternOptions.uid];
    if (precomputedBulletPattern) {
        return precomputedBulletPattern;
    }

    if (!patternOptions.disablePrecomputation && !firstCompute) {
        console.warn("Bullet pattern wasn't precomputed, this is gonna take a while", patternOptions.pattern);
    }

    const functionName = 'make' + capFirst(patternOptions.pattern) + 'Pattern';
    const patternFunction = patternMap[functionName];
    if (!patternFunction) throw new Error('Pattern type not supported: ' + patternOptions.pattern);
    const pattern = patternFunction(patternOptions);

    if (patternOptions.offset) {
        if (pattern.positions instanceof Texture) {
            throw new Error('Offset can not be applied when positions is a Texture');
        }
        const offset = new RandVector3(...patternOptions.offset);
        pattern.positions.forEach((position) => position.addInPlace(offset));
    }

    if (!pattern.timings) {
        if (pattern.positions instanceof Texture) {
            throw new Error('Timings must be supplied when positions is a Texture');
        }
        pattern.timings = new Array(pattern.positions.length);
        for (let i = 0; i < pattern.positions.length; ++i) pattern.timings[i] = 0;
    }

    if (patternOptions.repeat) {
        if (pattern.positions instanceof Texture) {
            throw new Error('Texture positions can not be repeated');
        }
        const newPositions = [];
        const newVelocities = [];
        const newTimings = [];
        for (let i = 0; i < patternOptions.repeat.times; i++) {
            newPositions.push(...pattern.positions);
            newVelocities.push(...pattern.velocities);
            newTimings.push(
                ...pattern.timings.map((timing) => {
                    if (!patternOptions.repeat)
                        throw new Error('Pattern Options did not have repeat when expected, this should never happen');
                    return timing + i * patternOptions.repeat.delay;
                }),
            );
        }
        pattern.positions = newPositions;
        pattern.velocities = newVelocities;
        pattern.timings = newTimings;
    }

    const computedPattern = pattern as BulletPattern;

    if (!precomputedBulletPattern && !patternOptions.disablePrecomputation) {
        cache.patterns[uid] = computedPattern;
        cache.textureCache[uid] = computeSourceTextures(computedPattern, scene);
    }

    computedPattern.uid = uid;
    return computedPattern;
};
