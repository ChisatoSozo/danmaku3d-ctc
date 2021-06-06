import { Vector3 } from '@babylonjs/core';
import { flatten } from 'lodash';
import { MakePattern } from './index';

interface burstArgs {
    num: number;
    radius: number;
    thetaStart?: number;
    thetaLength?: number;
    yStart?: number;
    yLength?: number;
}
const burst: (args: burstArgs) => Vector3[] = ({
    num,
    radius,
    thetaStart = 0,
    thetaLength = Math.PI * 2,
    yStart = 1,
    yLength = 2,
}) => {
    const points = [];
    const phi = Math.PI * (3 - Math.sqrt(5)); //golden angle in radians

    for (let i = 0; i < num; i++) {
        const y = yStart - (i / (num - 1)) * yLength; //y goes from 1 to -1
        const curRadius = Math.sqrt(1 - y * y); //radius at y

        const theta = ((phi * i) % thetaLength) + thetaStart; //golden angle increment

        const x = Math.cos(theta) * curRadius;
        const z = Math.sin(theta) * curRadius;
        points.push(new Vector3(x, y, z).scale(radius));
    }

    return points;
};

export const makeBurstPattern: MakePattern = (patternOptions) => {
    let positions: Vector3[] = [];
    let velocities: Vector3[] = [];

    if (patternOptions.speeds) {
        positions = flatten(patternOptions.speeds.map(() => burst({ ...patternOptions })));
        velocities = flatten(patternOptions.speeds.map((speed) => burst({ ...patternOptions, radius: speed })));
    } else {
        positions = burst({ ...patternOptions });
        velocities = burst({ ...patternOptions, radius: patternOptions.speed });
    }

    return {
        positions: positions,
        velocities: velocities,
    };
};
