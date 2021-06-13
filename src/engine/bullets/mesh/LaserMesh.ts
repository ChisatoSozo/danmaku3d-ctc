import { Mesh } from '@babylonjs/core';
import { MakeMesh } from '.';
import { getModel } from '../../hooks/useModel';

export const makeLaserMesh: MakeMesh = (meshOptions, assets) => {
    const laserModel = getModel(assets, 'laser', true);
    if (!laserModel) throw new Error('laserModel not loaded');

    const mesh = laserModel.mesh as Mesh;

    return mesh;
};
