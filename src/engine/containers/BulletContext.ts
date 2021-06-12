import { Mesh, ShaderMaterial, TransformNode, Vector3 } from '@babylonjs/core';
import { isFunction } from 'lodash';
import React, { useCallback, useMemo } from 'react';
import { useScene } from 'react-babylonjs';
import { v4 as uuid } from 'uuid';
import { makeBulletBehaviour } from '../bullets/behaviour';
import { BulletBehaviour } from '../bullets/behaviour/BulletBehaviour';
import { BULLET_TYPE, EnemyBulletBehaviour } from '../bullets/behaviour/EnemyBulletBehaviour';
import { makeEndTimings } from '../bullets/endTimings';
import { makeBulletMaterial } from '../bullets/materials';
import { makeBulletMesh } from '../bullets/mesh';
import { makeBulletPattern } from '../bullets/patterns';
import { EnemySound, makeBulletSound } from '../bullets/sounds';
import { CustomFloatProceduralTexture } from '../forks/CustomFloatProceduralTexture';
import { useDeltaBeforeRender } from '../hooks/useDeltaBeforeRender';
import { makeName } from '../hooks/useName';
import { globalActorRefs } from '../RefSync';
import { BulletCache, BulletInstruction, PreBulletInstruction, UnevalBulletInstruction } from '../types/BulletTypes';
import { DeepPartial } from '../types/UtilTypes';
import { MAX_BULLETS_PER_GROUP } from '../utils/Constants';
import { IAssetContext } from './AssetContext';
import { LS } from './LSContainer';

const defaultBulletInstruction: UnevalBulletInstruction = {
    materialOptions: {
        material: 'fresnel',
        color: [1, 0, 0],
        doubleSided: false,
    },
    patternOptions: {
        pattern: 'burst',
        num: 100,
        speed: 1,
        radius: 1,
        disablePrecomputation: false,
    },
    endTimingOptions: {
        timing: 'lifespan',
        disablePrecomputation: false,
    },
    meshOptions: {
        mesh: 'sphere',
        radius: 1,
    },
    behaviourOptions: {
        behaviour: 'linear',
        bulletValue: 1,
        bulletType: BULLET_TYPE.BULLET,
        translationFromParent: true,
        rotationFromParent: false,
        disableWarning: false,
    },
    soundOptions: {
        mute: false,
        sound: 'enemyShoot',
    },
    uid: '',
    lifespan: 10,
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const evalOption = (option: { [key: string]: any }) => {
    for (const key in option) {
        if (isFunction(option[key])) {
            option[key] = option[key](LS.DIFFICULTY_NUMBER);
        }
    }
};

const prepareBulletInstruction = (instruction: DeepPartial<PreBulletInstruction>) => {
    const newInstruction: DeepPartial<UnevalBulletInstruction> = isFunction(instruction)
        ? instruction(LS.DIFFICULTY_NUMBER)
        : instruction;

    if (!newInstruction) throw new Error('Instruction ended up being undefined or null');
    if (!newInstruction.materialOptions) newInstruction.materialOptions = {};
    if (!newInstruction.patternOptions) newInstruction.patternOptions = {};
    if (!newInstruction.endTimingOptions) newInstruction.endTimingOptions = {};
    if (!newInstruction.meshOptions) newInstruction.meshOptions = {};
    if (!newInstruction.behaviourOptions) newInstruction.behaviourOptions = {};
    if (!newInstruction.soundOptions) newInstruction.soundOptions = {};
    newInstruction.materialOptions = { ...defaultBulletInstruction.materialOptions, ...newInstruction.materialOptions };
    newInstruction.patternOptions = { ...defaultBulletInstruction.patternOptions, ...newInstruction.patternOptions };
    newInstruction.endTimingOptions = { ...defaultBulletInstruction.endTimingOptions, ...newInstruction.endTimingOptions };
    newInstruction.meshOptions = { ...defaultBulletInstruction.meshOptions, ...newInstruction.meshOptions };
    newInstruction.behaviourOptions = { ...defaultBulletInstruction.behaviourOptions, ...newInstruction.behaviourOptions };
    newInstruction.soundOptions = { ...defaultBulletInstruction.soundOptions, ...newInstruction.soundOptions };
    evalOption(newInstruction.materialOptions);
    evalOption(newInstruction.patternOptions);
    evalOption(newInstruction.endTimingOptions);
    evalOption(newInstruction.meshOptions);
    evalOption(newInstruction.behaviourOptions);
    evalOption(newInstruction.soundOptions);
    evalOption(newInstruction);

    const uid = newInstruction.uid || uuid();
    newInstruction.materialOptions.uid = uid;
    newInstruction.patternOptions.uid = uid;
    newInstruction.endTimingOptions.uid = uid;
    newInstruction.meshOptions.uid = uid;
    newInstruction.behaviourOptions.uid = uid;
    newInstruction.soundOptions.uid = uid;

    newInstruction.lifespan = newInstruction.lifespan || defaultBulletInstruction.lifespan;

    return newInstruction as BulletInstruction;
};

const bufferMatricesPreCompute = new Float32Array(MAX_BULLETS_PER_GROUP * 16);

const makeInstances = (mesh: Mesh, num: number) => {
    if (num > MAX_BULLETS_PER_GROUP) throw new Error('MAX_BULLETS_PER_GROUP is ' + MAX_BULLETS_PER_GROUP + ' You have ' + num);
    mesh.thinInstanceSetBuffer('matrix', bufferMatricesPreCompute.slice(0, num * 16), 16, true);
};

type AddBulletGroup = (
    parent: TransformNode,
    instruction: DeepPartial<PreBulletInstruction>,
    sourceBulletId?: string,
    supressNotPrecomputedWarning?: boolean,
) => string;

interface IBulletContext {
    addBulletGroup: AddBulletGroup | undefined;
}

const defaultBulletContext: () => IBulletContext = () => ({
    addBulletGroup: () => '',
});
interface BulletGroup {
    behaviour: BulletBehaviour;
    mesh: Mesh;
    material: ShaderMaterial;
    initialPositions: Vector3[] | CustomFloatProceduralTexture;
    initialVelocities: Vector3[];
    timings: number[];
    endTimings: number[];
    downsampleCollisions: boolean;
    translationFromParent: boolean;
    rotationFromParent: boolean;
    disableWarning: boolean;
    instruction: BulletInstruction;

    lifespan: number;
    timeSinceStart: number;
    sounds: EnemySound | false;
}
interface BulletGroupMap {
    [key: string]: BulletGroup;
}

const bulletGroupDispose = (group: BulletGroup) => {
    group.material.dispose();
    group.behaviour.dispose();
    group.mesh.dispose();
};

export const BulletContext = React.createContext<IBulletContext>(defaultBulletContext());

export const useBulletContext = (assetContext: IAssetContext, environmentCollision: Vector3) => {
    const scene = useScene();
    const { assets, assetsLoaded } = assetContext;

    const bulletCache = useMemo<BulletCache>(
        () => ({
            textureCache: {},
            patterns: {},
            endTimings: {},
        }),
        [],
    );

    const allBullets = useMemo<BulletGroupMap>(() => ({}), []);

    const dispose = useCallback(
        (ids: string[]) => {
            ids.forEach((id) => {
                bulletGroupDispose(allBullets[id]);
                delete allBullets[id];
            });
        },
        [allBullets],
    );

    const addBulletGroup = useMemo(() => {
        if (!assetsLoaded) return;
        return (
            parent: TransformNode,
            instruction: DeepPartial<PreBulletInstruction>,
            sourceBulletId?: string,
            supressNotPrecomputedWarning = false,
        ) => {
            if (!parent) throw new Error('parent not ready!');
            if (!scene) throw new Error('scene not ready!');
            const preparedInstruction = prepareBulletInstruction(instruction);
            if (!preparedInstruction) throw new Error('Instruction could not be prepared');
            if (sourceBulletId) preparedInstruction.patternOptions.sourceBulletId = sourceBulletId;

            const {
                positions: initialPositions,
                velocities: initialVelocities,
                timings,
                uid,
            } = makeBulletPattern(preparedInstruction.patternOptions, bulletCache, scene, supressNotPrecomputedWarning);
            const material = makeBulletMaterial(preparedInstruction.materialOptions, assets, scene);
            const mesh = makeBulletMesh(preparedInstruction.meshOptions, assets, scene);
            const behaviour = makeBulletBehaviour(
                preparedInstruction.behaviourOptions,
                environmentCollision,
                preparedInstruction.meshOptions.radius,
                parent,
            );
            const endTimings = makeEndTimings(
                preparedInstruction.endTimingOptions,
                timings.length,
                preparedInstruction.lifespan,
                bulletCache,
                scene,
            );
            const sounds =
                preparedInstruction.soundOptions &&
                !preparedInstruction.soundOptions.mute &&
                makeBulletSound(preparedInstruction.soundOptions, timings);

            makeInstances(mesh, timings.length);

            mesh.material = material;

            const translationFromParent = preparedInstruction.behaviourOptions.translationFromParent;
            const rotationFromParent = preparedInstruction.behaviourOptions.rotationFromParent;
            const disableWarning = preparedInstruction.behaviourOptions.disableWarning || false;

            const downsampleCollisions = behaviour instanceof EnemyBulletBehaviour;

            behaviour.init({
                material,
                initialPositions,
                initialVelocities,
                timings,
                endTimings,
                downsampleCollisions,
                translationFromParent,
                rotationFromParent,
                disableWarning,
                uid,
                bulletCache,
                scene,
            });

            const { lifespan } = preparedInstruction;
            const timeSinceStart = 0;

            const bulletGroup = {
                behaviour,
                mesh,
                material,
                initialPositions,
                initialVelocities,
                timings,
                endTimings,
                downsampleCollisions,
                translationFromParent,
                rotationFromParent,
                disableWarning,
                instruction: preparedInstruction,
                lifespan,
                timeSinceStart,
                sounds,
            };

            const newID = makeName('bulletGroup');
            allBullets[newID] = bulletGroup;
            return newID;
        };
    }, [assetsLoaded, scene, bulletCache, assets, environmentCollision, allBullets]);

    useDeltaBeforeRender((scene, deltaS) => {
        const toRemove: string[] = [];

        Object.keys(allBullets).forEach((bulletGroupIndex) => {
            const bulletGroup = allBullets[bulletGroupIndex];
            bulletGroup.timeSinceStart += deltaS;
            if (bulletGroup.timeSinceStart > bulletGroup.lifespan) {
                toRemove.push(bulletGroupIndex);
            } else {
                bulletGroup.behaviour.update(deltaS);
                if (bulletGroup.sounds) bulletGroup.sounds.update(deltaS);
            }
        });

        if (toRemove.length > 0) dispose(toRemove);

        globalActorRefs.enemies.forEach((enemy, i) => {
            const offset = i * 3;
            globalActorRefs.enemyPositionBuffer[offset + 0] = enemy.position.x;
            globalActorRefs.enemyPositionBuffer[offset + 1] = enemy.position.y;
            globalActorRefs.enemyPositionBuffer[offset + 2] = enemy.position.z;
            globalActorRefs.enemyRadiiBuffer[i] = enemy.radius;
        });

        globalActorRefs.bombs.forEach((bomb, i) => {
            const offset = i * 3;
            globalActorRefs.bombPositionBuffer[offset + 0] = bomb.position.x;
            globalActorRefs.bombPositionBuffer[offset + 1] = bomb.position.y;
            globalActorRefs.bombPositionBuffer[offset + 2] = bomb.position.z;
            globalActorRefs.bombRadiiBuffer[i] = bomb.radius;
        });
    });

    return { addBulletGroup };
};
