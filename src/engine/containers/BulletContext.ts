import { isFunction } from 'lodash';
import React, { useCallback } from 'react';
import { v4 as uuid } from 'uuid';
import { BulletInstruction, PreBulletInstruction, UnevalBulletInstruction } from '../types/BulletTypes';
import { DeepPartial } from '../types/UtilTypes';
import { LS } from './LSContainer';

const defaultBulletInstruction = {
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

interface IBulletContext {
    addBulletGroup: (instruction: DeepPartial<PreBulletInstruction>) => BulletInstruction | undefined;
}

const defaultBulletContext: () => IBulletContext = () => ({
    addBulletGroup: (instruction: DeepPartial<PreBulletInstruction>) => prepareBulletInstruction(instruction),
});

export const BulletContext = React.createContext<IBulletContext>(defaultBulletContext());

export const useBulletContext = () => {
    const addBulletGroup = useCallback((instruction: DeepPartial<PreBulletInstruction>) => {
        return prepareBulletInstruction(instruction);
    }, []);

    return { addBulletGroup };
};
