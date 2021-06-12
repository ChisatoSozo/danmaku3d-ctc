import { Scene } from '@babylonjs/core';
import { times } from 'lodash';
import { BulletCache, EndTimingOptions } from '../../types/BulletTypes';
import { makeTextureFromArray } from '../../utils/BulletUtils';

export const makeEndTimings = (
    endTimingsOptions: EndTimingOptions,
    num: number,
    lifespan: number,
    bulletCache: BulletCache,
    scene: Scene,
) => {
    const uid = endTimingsOptions.uid;

    const precomputedEndTiming = bulletCache.endTimings[uid];
    if (precomputedEndTiming) {
        return precomputedEndTiming;
    }

    let timings: number[] = [];

    switch (endTimingsOptions.timing) {
        case 'lifespan': {
            const timing = lifespan === Infinity ? 8000000 : lifespan;
            timings = times(num, () => timing);
            break;
        }
        case 'batch': {
            if (!endTimingsOptions.times) throw new Error('times must be set when endTimings type is batch');
            const endTimings: number[] = [];
            endTimingsOptions.times.forEach((time) => {
                if (!endTimingsOptions.times) throw new Error('times must be set when endTimings type is batch');
                endTimings.push(...times(num / endTimingsOptions.times.length, () => time));
            });
            timings = endTimings;
            break;
        }
        case 'uniform':
            if (!endTimingsOptions.time) throw new Error('time must be set when endTimings type is uniform');
            timings = times<number>(num, () => {
                if (!endTimingsOptions.time) throw new Error('time must be set when endTimings type is uniform');
                return endTimingsOptions.time;
            });
            break;
        default:
            throw new Error('invalid end timing type ' + endTimingsOptions.timing);
    }

    if (!precomputedEndTiming && !endTimingsOptions.disablePrecomputation) {
        bulletCache.endTimings[uid] = timings;
        bulletCache.textureCache[uid].endTimings = makeTextureFromArray(timings, scene);
    }

    return timings;
};
