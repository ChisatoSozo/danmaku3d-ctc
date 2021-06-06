import { Scalar, Vector3 } from '@babylonjs/core';
import { ARENA_HEIGHT, ARENA_LENGTH, ARENA_WIDTH } from '../utils/Constants';

type randArg = number[] | number | 'rand';

export type RandVectorIn = [x?: randArg, y?: randArg, z?: randArg, normalizeToLength?: number];
export class RandVector3 extends Vector3 {
    constructor(x?: randArg, y?: randArg, z?: randArg, normalizeToLength?: number) {
        if (x === 'rand') {
            x = Scalar.RandomRange(-1, 1);
        } else if (Array.isArray(x)) {
            x = Scalar.RandomRange(x[0], x[1]);
        }

        if (y === 'rand') {
            y = Scalar.RandomRange(-1, 1);
        } else if (Array.isArray(y)) {
            y = Scalar.RandomRange(y[0], y[1]);
        }

        if (z === 'rand') {
            z = Scalar.RandomRange(-1, 1);
        } else if (Array.isArray(z)) {
            z = Scalar.RandomRange(z[0], z[1]);
        }

        //Weird GLSL bug if this doesn't happen
        if (!x) {
            x = 0.000001;
        }
        if (!y) {
            y = 0.000001;
        }
        if (!z) {
            z = 0.000001;
        }

        super(x, y, z);

        if (normalizeToLength) {
            this.normalize().scaleInPlace(normalizeToLength);
        }
    }
}

export function randScalar(x: randArg) {
    x = x || 1;

    if (x === 'rand') {
        x = Scalar.RandomRange(0, 1);
    } else if (Array.isArray(x)) {
        x = Scalar.RandomRange(x[0], x[1]);
    }
    return x;
}

export const normalizePosition = (position: Vector3) => {
    return position.multiplyByFloats(2 / ARENA_WIDTH, 2 / ARENA_HEIGHT, 2 / ARENA_LENGTH).subtractFromFloats(0, 1, 0);
};

export const unnormalizePosition = (position: Vector3) => {
    return position.add(new Vector3(0, 1, 0)).multiplyByFloats(ARENA_WIDTH / 2, ARENA_HEIGHT / 2, ARENA_LENGTH / 2);
};

export const randVectorToPosition = (arrayVector: Vector3 | randArg[]) => {
    if (arrayVector instanceof Vector3) {
        return arrayVector;
    }

    const position = new RandVector3(...arrayVector);
    return unnormalizePosition(position);
};

export const glsl = (template: TemplateStringsArray, ...args: (string | number)[]) => {
    let str = '';
    for (let i = 0; i < args.length; i++) {
        str += template[i] + String(args[i]);
    }
    return str + template[template.length - 1];
};
