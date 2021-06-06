import { MakeMesh } from '.';

export const makeSphereMesh: MakeMesh = (meshOptions, assets) => {
    const _sphere = assets.meshes['sphere'];
    if (!_sphere) throw new Error('Sphere mesh not loaded');

    const sphere = _sphere.clone().makeGeometryUnique();
    return sphere;
};
