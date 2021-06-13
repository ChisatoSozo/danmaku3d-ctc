import { RawTexture, Vector3 } from '@babylonjs/core';
import { BulletType } from '../bullets/behaviour/EnemyBulletBehaviour';
import { CustomFloatProceduralTexture } from '../forks/CustomFloatProceduralTexture';
import { RandVectorIn } from '../utils/BabylonUtils';
import { DifficultyNumber } from '../utils/Constants';

type TypeOrFunc<T> = T | ((difficulty: DifficultyNumber) => T);
type DeepTypeOrFunc<T> = {
    [P in keyof T]: TypeOrFunc<T[P]>;
};

export interface MaterialOptions {
    material: string;
    color: number[];
    doubleSided: boolean;
    uid: string;
    hasAlpha?: boolean;
    alpha?: number;
    glow?: boolean;
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

    sourceBulletId?: string;
}

export interface EndTimingOptions {
    timing: string;
    times?: number[];
    time?: number;
    disablePrecomputation: boolean;
    uid: string;
}

export interface MeshOptions {
    mesh: string;
    radius: number;
    laserLength?: number;
    uid: string;
}

export interface BehaviourOptions {
    behaviour: string;
    bulletValue: number;
    bulletType?: BulletType;
    translationFromParent: boolean;
    rotationFromParent: boolean;
    disableWarning: boolean;
    uid: string;
}

export interface SoundOptions {
    mute: boolean;
    sound: string;
    uid: string;
}

export type BulletInstruction = {
    materialOptions: MaterialOptions;
    patternOptions: PatternOptions;
    endTimingOptions: EndTimingOptions;
    meshOptions: MeshOptions;
    behaviourOptions: BehaviourOptions;
    soundOptions: SoundOptions;
    uid: string;
    lifespan: number;
};

export interface UnevalBulletInstruction {
    materialOptions: DeepTypeOrFunc<MaterialOptions>;
    patternOptions: DeepTypeOrFunc<PatternOptions>;
    endTimingOptions: DeepTypeOrFunc<EndTimingOptions>;
    meshOptions: DeepTypeOrFunc<MeshOptions>;
    behaviourOptions: DeepTypeOrFunc<BehaviourOptions>;
    soundOptions: DeepTypeOrFunc<SoundOptions>;
    uid: string;
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
    positions: Vector3[] | CustomFloatProceduralTexture;
    velocities: Vector3[];
    timings: number[];
    uid: string;
}

export interface BulletCache {
    textureCache: {
        [uid: string]: {
            initialPositions: RawTexture;
            initialVelocities: RawTexture;
            timings: RawTexture;
            positions: RawTexture;
            velocities: RawTexture;
            collisions: RawTexture;
            endTimings?: RawTexture;
        };
    };
    patterns: {
        [uid: string]: BulletPattern;
    };
    endTimings: {
        [uid: string]: number[];
    };
}
