import { Scene, TransformNode, Vector3 } from '@babylonjs/core';
import { IAssetContext } from '../../containers/AssetContext';
import { BehaviourOptions } from '../../types/BulletTypes';
import { capFirst } from '../../utils/Utils';
import { BulletBehaviour } from './BulletBehaviour';
import { makeLinearBehaviour } from './LinearBehaviour';

const behaviourMap: {
    [behaviourName: string]: MakeBehaviour;
} = {
    makeLinearBehaviour,
};

export type MakeBehaviour = (
    behaviourOptions: BehaviourOptions,
    environmentCollision: Vector3,
    assets: IAssetContext,
    scene: Scene,
    radius: number,
    parent: TransformNode,
) => BulletBehaviour;

export const makeBulletBehaviour: MakeBehaviour = (behaviourOptions, environmentCollision, assets, scene, radius, parent) => {
    const functionName = 'make' + capFirst(behaviourOptions.behaviour) + 'Behaviour';
    const behaviourFunction = behaviourMap[functionName];
    if (!behaviourFunction) throw new Error('Behaviour type not supported: ' + behaviourOptions.behaviour);
    const behaviour = behaviourFunction(behaviourOptions, environmentCollision, assets, scene, radius, parent);

    return behaviour;
};
