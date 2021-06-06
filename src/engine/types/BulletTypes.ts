import { RawTexture, Texture, Vector3 } from '@babylonjs/core';
import { RandVectorIn } from '../utils/BabylonUtils';
import { DifficultyNumber } from '../utils/Constants';

type TypeOrFunc<T> = T | ((difficulty: DifficultyNumber) => T);
type DeepTypeOrFunc<T> = {
    [P in keyof T]?: TypeOrFunc<T[P]>;
};

export interface MaterialOptions {
    material: string;
    color: number[];
    doubleSided: boolean;
    hasAlpha?: boolean;
    alpha?: number;
}

export interface PatternOptions {
    uid: string;
    pattern: string;
    num: number;
    speed: number;
    radius: number;
    disablePrecomputation: boolean;
    repeat?: {
        times: number;
        delay: number;
    };
    offset?: RandVectorIn;
    speeds?: number[];
    thetaStart?: number;
    thetaLength?: number;
    yStart?: number;
    yLength?: number;
}

export interface EndTimingOptions {
    timing: string;
}

export interface MeshOptions {
    mesh: string;
    radius: number;
}

export interface BehaviourOptions {
    behaviour: string;
}

export interface SoundOptions {
    mute: boolean;
    sound: string;
}

export type BulletInstruction = {
    materialOptions: MaterialOptions;
    patternOptions: PatternOptions;
    endTimingOptions: EndTimingOptions;
    meshOptions: MeshOptions;
    behaviourOptions: BehaviourOptions;
    soundOptions: SoundOptions;
    lifespan: number;
};

export interface UnevalBulletInstruction {
    materialOptions: DeepTypeOrFunc<MaterialOptions>;
    patternOptions: DeepTypeOrFunc<PatternOptions>;
    endTimingOptions: DeepTypeOrFunc<EndTimingOptions>;
    meshOptions: DeepTypeOrFunc<MeshOptions>;
    behaviourOptions: DeepTypeOrFunc<BehaviourOptions>;
    soundOptions: DeepTypeOrFunc<SoundOptions>;
    lifespan: TypeOrFunc<number>;
}

export type PreBulletInstruction = TypeOrFunc<{
    materialOptions: DeepTypeOrFunc<MaterialOptions>;
    patternOptions: DeepTypeOrFunc<PatternOptions>;
    endTimingOptions: DeepTypeOrFunc<EndTimingOptions>;
    meshOptions: DeepTypeOrFunc<MeshOptions>;
    behaviourOptions: DeepTypeOrFunc<BehaviourOptions>;
    soundOptions: DeepTypeOrFunc<SoundOptions>;
    lifespan: TypeOrFunc<number>;
}>;

export interface BulletPattern {
    positions: Vector3[] | Texture;
    velocities: Vector3[];
    timings: number[];
    uid: string;
}

export interface BulletCache {
    positionTextureCache: {
        [uid: string]: {
            initialPositions: RawTexture;
            velocities: RawTexture;
            timings: RawTexture;
            positions: RawTexture;
            collisions: RawTexture;
        };
    };
    patterns: {
        [uid: string]: BulletPattern;
    };
}
