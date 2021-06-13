import { Mesh, Scene } from '@babylonjs/core';
import { Assets } from '../../containers/AssetContext';
import { MeshOptions } from '../../types/BulletTypes';
import { capFirst } from '../../utils/Utils';
import { makeLaserMesh } from './LaserMesh';
import { makeSphereMesh } from './SphereMesh';

const meshMap: {
    [meshName: string]: MakeMesh;
} = {
    makeSphereMesh,
    makeLaserMesh,
};

export type MakeMesh = (meshOptions: MeshOptions, assets: Assets, scene: Scene) => Mesh;

export const makeBulletMesh: MakeMesh = (meshOptions, assets, scene) => {
    const functionName = 'make' + capFirst(meshOptions.mesh) + 'Mesh';
    const meshFunction = meshMap[functionName];
    if (!meshFunction) throw new Error('Mesh type not supported: ' + meshOptions.mesh);
    const mesh = meshFunction(meshOptions, assets, scene);

    return mesh;
};
