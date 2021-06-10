import { TransformNode } from '@babylonjs/core';
import { isFunction } from 'lodash';
import React, { useCallback, useMemo } from 'react';
import { useScene } from 'react-babylonjs';
import { v4 as uuid } from 'uuid';
import { BULLET_TYPE } from '../bullets/behaviour/EnemyBulletBehaviour';
import { makeBulletPattern } from '../bullets/patterns';
import { BulletCache, BulletInstruction, PreBulletInstruction, UnevalBulletInstruction } from '../types/BulletTypes';
import { DeepPartial } from '../types/UtilTypes';
import { LS } from './LSContainer';

const defaultBulletInstruction: UnevalBulletInstruction = {
    materialOptions: {
        material: 'fresnel',
        color: [1, 0, 0],
        doubleSided: false,
        uid: () => uuid(),
    },
    patternOptions: {
        pattern: 'burst',
        num: 100,
        speed: 1,
        radius: 1,
        disablePrecomputation: false,
        uid: () => uuid(),
    },
    endTimingOptions: {
        timing: 'lifespan',
        uid: () => uuid(),
    },
    meshOptions: {
        mesh: 'sphere',
        radius: 1,
        uid: () => uuid(),
    },
    behaviourOptions: {
        behaviour: 'linear',
        bulletValue: 1,
        bulletType: BULLET_TYPE.BULLET,
        uid: () => uuid(),
    },
    soundOptions: {
        mute: false,
        sound: 'enemyShoot',
        uid: () => uuid(),
    },
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

    return newInstruction as BulletInstruction;
};

type AddBulletGroup = (
    parent: TransformNode,
    instruction: DeepPartial<PreBulletInstruction>,
    sourceBulletId?: string,
    supressNotPrecomputedWarning?: boolean,
) => BulletInstruction | undefined;

interface IBulletContext {
    addBulletGroup: AddBulletGroup;
}

const defaultBulletContext: () => IBulletContext = () => ({
    addBulletGroup: () => undefined,
});

export const BulletContext = React.createContext<IBulletContext>(defaultBulletContext());

export const useBulletContext = () => {

    const bulletCache = useMemo<BulletCache>(() => ({
        textureCache: {},
        patterns: {}
    }), [])

    const scene = useScene()

    const addBulletGroup = useCallback(
        (
            parent: TransformNode,
            instruction: DeepPartial<PreBulletInstruction>,
            sourceBulletId = false,
            supressNotPrecomputedWarning = false,
        ) => {
            if (!parent) throw new Error('parent not ready!');

            const preparedInstruction = prepareBulletInstruction(instruction);
            if (!preparedInstruction) return;
            if (sourceBulletId) preparedInstruction.patternOptions.sourceBulletId = sourceBulletId;

            const { positions, velocities, timings, uid } = makeBulletPattern(
                preparedInstruction.patternOptions,
                bulletCache
                scene,
                supressNotPrecomputedWarning,
            );
            const material = makeBulletMaterial(preparedInstruction.materialOptions, parent, assets, scene);
            const { mesh, radius } = makeBulletMesh(preparedInstruction.meshOptions, assets, getMesh);
            const behaviour = makeBulletBehaviour(preparedInstruction.behaviourOptions, environmentCollision, radius, parent);
            const endTimings = makeEndTimings(preparedInstruction.endTimings, preparedInstruction.lifespan, timings.length, scene);
            const sounds =
                preparedInstruction.soundOptions &&
                !preparedInstruction.soundOptions.mute &&
                makeBulletSound(preparedInstruction.soundOptions, timings);

            mesh.makeInstances(timings.length);
            mesh.material = material;

            const reliesOnParent = preparedInstruction.behaviourOptions.reliesOnParent;
            const disableWarning = preparedInstruction.behaviourOptions.disableWarning || false;

            behaviour.init(material, positions, velocities, timings, endTimings, reliesOnParent, disableWarning, uid, scene);

            const { lifespan } = preparedInstruction;
            const timeSinceStart = 0;

            const bulletGroup = new BulletGroup({
                material,
                mesh,
                behaviour,
                sounds,
                positions,
                velocities,
                timings,
                endTimings,
                lifespan,
                timeSinceStart,
                uid,
                instruciton: preparedInstruction,
                releaseMesh,
            });

            const newID = makeName('bulletGroup');
            allBullets[newID] = bulletGroup;
            return newID;
        },
        [scene, assets, getMesh, environmentCollision, releaseMesh],
    );

    return { addBulletGroup };
};
