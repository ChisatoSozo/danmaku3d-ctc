import { TransformNode, Vector3 } from '@babylonjs/core';
import { BehaviourOptions } from '../../types/BulletTypes';
import { capFirst } from '../../utils/Utils';
import { BulletBehaviour } from './BulletBehaviour';
import { makeLinearBehaviour } from './LinearBehaviour';
import { makeLinearLaserBehaviour } from './LinearLaserBehaviour';

const behaviourMap: {
    [behaviourName: string]: MakeBehaviour;
} = {
    makeLinearBehaviour,
    makeLinearLaserBehaviour,
};

export type MakeBehaviour = (
    behaviourOptions: BehaviourOptions,
    environmentCollision: Vector3,
    radius: number,
    parent: TransformNode,
) => BulletBehaviour;

export const makeBulletBehaviour: MakeBehaviour = (behaviourOptions, environmentCollision, radius, parent) => {
    const functionName = 'make' + capFirst(behaviourOptions.behaviour) + 'Behaviour';
    const behaviourFunction = behaviourMap[functionName];
    if (!behaviourFunction) throw new Error('Behaviour type not supported: ' + behaviourOptions.behaviour);
    const behaviour = behaviourFunction(behaviourOptions, environmentCollision, radius, parent);

    return behaviour;
};
