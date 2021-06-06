import { Mesh, Scene } from '@babylonjs/core';
import { IAssetContext } from '../../containers/AssetContext';
import { MeshOptions } from '../../types/BulletTypes';
import { capFirst } from '../../utils/Utils';
import { makeSphereMesh } from './Sphere';

const meshMap: {
    [meshName: string]: MakeMesh;
} = {
    makeSphereMesh,
};

export type MakeMesh = (meshOptions: MeshOptions, assets: IAssetContext, scene: Scene) => Mesh;

export const makeBulletMesh: MakeMesh = (meshOptions, assets, scene) => {
    const functionName = 'make' + capFirst(meshOptions.mesh) + 'Mesh';
    const meshFunction = meshMap[functionName];
    if (!meshFunction) throw new Error('Mesh type not supported: ' + meshOptions.mesh);
    const mesh = meshFunction(meshOptions, assets, scene);

    return mesh;
};
