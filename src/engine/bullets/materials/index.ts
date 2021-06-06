import { Material, Scene } from '@babylonjs/core';
import { IAssetContext } from '../../containers/AssetContext';
import { MaterialOptions } from '../../types/BulletTypes';
import { capFirst } from '../../utils/Utils';
import { makeFresnelMaterial } from './FresnelMaterial';

const materialMap: {
    [materialName: string]: MakeMaterial;
} = {
    makeFresnelMaterial,
};

export type MakeMaterial = (materialOptions: MaterialOptions, assets: IAssetContext, scene: Scene) => Material;

export const makeBulletMaterial: MakeMaterial = (materialOptions, assets, scene) => {
    const functionName = 'make' + capFirst(materialOptions.material) + 'Material';
    const materialFunction = materialMap[functionName];
    if (!materialFunction) throw new Error('Material type not supported: ' + materialOptions.material);
    const material = materialFunction(materialOptions, assets, scene);

    material.backFaceCulling = !materialOptions.doubleSided;

    return material;
};
