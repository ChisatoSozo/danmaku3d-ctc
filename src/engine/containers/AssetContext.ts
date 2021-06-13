import {
    AbstractAssetTask,
    AssetContainer,
    AssetsManager,
    ContainerAssetTask,
    IParticleSystem,
    Mesh,
    MeshBuilder,
    ParticleHelper,
    ParticleSystemSet,
    Scene,
    Texture,
    TextureAssetTask,
} from '@babylonjs/core';
import parsePath from 'parse-filepath';
import React, { useEffect, useState } from 'react';
import { useScene } from 'react-babylonjs';
import { nullVector, QualityName } from '../utils/Constants';
import { LS } from './LSContext';

export interface Assets {
    containers: {
        [key: string]: AssetContainer | undefined;
    };
    textures: {
        [key: string]: Texture | undefined;
    };
    meshes: {
        [key: string]: Mesh | undefined;
    };
    particles: {
        [key: string]: IParticleSystem | undefined;
    };
}
export interface IAssetContext {
    assets: Assets;
    assetsLoaded: boolean;
}

const defaultAssetContext: () => IAssetContext = () => ({
    assets: {
        containers: {},
        textures: {},
        meshes: {},
        particles: {},
    },
    assetsLoaded: false,
});

export const AssetContext = React.createContext<IAssetContext>(defaultAssetContext());

const qualityMap: {
    [key in QualityName]: {
        segments: number;
    };
} = {
    Hi: { segments: 10 },
    Med: { segments: 6 },
    Low: { segments: 3 },
};

const assetFunctions: { [key: string]: (scene: Scene) => Mesh } = {
    sphere: (scene) => {
        const mesh = MeshBuilder.CreateSphere(
            'sphere',
            {
                diameter: 2,
                segments: qualityMap[LS.QUALITY].segments || 10,
                updatable: false,
            },
            scene,
        );

        mesh.isVisible = false;
        return mesh;
    },
};

const loadAssets = async (scene: Scene, assetPaths: string[]) => {
    return new Promise<Assets>((resolve, reject) => {
        const assetsManager = new AssetsManager(scene);

        const loadedMeshes: { [key: string]: Mesh } = {};
        const loadedParticles: { [key: string]: IParticleSystem } = {};

        assetPaths.forEach((path) => {
            let assetTask: AbstractAssetTask;

            const parsedPath = parsePath(path);
            const extension = parsedPath.ext;
            const base = parsedPath.base;
            const directory = parsedPath.dir;
            const name = parsedPath.name;

            switch (extension) {
                case '.png':
                case '.jpg':
                    assetTask = assetsManager.addTextureTask(name, path);
                    assetTask.onSuccess = (task) => {
                        task.texture.hasAlpha = true;
                    };
                    assetTask.onError = console.error;
                    break;
                case '.glb':
                case '.gltf':
                    assetTask = assetsManager.addContainerTask(name, '', directory + '/', base);
                    assetTask.onError = console.error;
                    break;
                case '.function':
                    loadedMeshes[name] = assetFunctions[name](scene);
                    break;
                case '.particles':
                    ParticleHelper.BaseAssetsUrl = directory;
                    ParticleSystemSet.BaseAssetsUrl = directory;
                    ParticleHelper.CreateAsync(name, scene, false).then(function (set) {
                        set.systems[0].emitter = nullVector;
                        loadedParticles[name] = set.systems[0];
                    });
                    break;
                default:
                    reject(`Unknown asset extension ${extension}`);
            }
        });

        assetsManager.onFinish = (tasks) => {
            const assets = defaultAssetContext().assets;

            tasks.forEach((task) => {
                if (task instanceof TextureAssetTask) {
                    if (task.name in assets.textures) reject(`Duplicate texture name ${task.name}`);
                    assets.textures[task.name] = task.texture;
                    return;
                }
                if (task instanceof ContainerAssetTask) {
                    if (task.name in assets.containers) reject(`Duplicate container name ${task.name}`);
                    assets.containers[task.name] = task.loadedContainer;
                    return;
                }
                reject('task was not an instanceof any known AssetTask');
            });

            assets.meshes = loadedMeshes;

            resolve(assets);
        };

        assetsManager.load();
    });
};

const internalAssetPaths = [
    'sphere.function',
    `${process.env.PUBLIC_URL}/engine-assets/bullets/laser.glb`, //laser
    `${process.env.PUBLIC_URL}/engine-assets/bullets/test.glb`, //test

    `${process.env.PUBLIC_URL}/engine-assets/textures/crosshair.png`, //crosshair texture

    `${process.env.PUBLIC_URL}/engine-assets/particles/hitParticles.particles`, //hit particles
];

export const useAssetContext = (assetPaths: string[]) => {
    const scene = useScene();
    const [internalAssets, setInternalAssets] = useState<Assets>();
    const [assets, setAssets] = useState<Assets>(defaultAssetContext().assets);

    const [assetsLoaded, setAssetsLoaded] = useState(false);

    useEffect(() => {
        if (!scene) return;
        loadAssets(scene, internalAssetPaths).then((loadedAssets) => {
            setInternalAssets(loadedAssets);
        });
    }, [scene]);

    useEffect(() => {
        setAssetsLoaded(false);
        if (!scene) return;
        if (!internalAssets) return;
        loadAssets(scene, assetPaths).then((loadedAssets) => {
            const assets = defaultAssetContext().assets;
            assets.textures = { ...internalAssets.textures, ...loadedAssets.textures };
            assets.containers = { ...internalAssets.containers, ...loadedAssets.containers };
            assets.meshes = { ...internalAssets.meshes, ...loadedAssets.meshes };
            assets.particles = { ...internalAssets.particles, ...loadedAssets.particles };
            setAssets(assets);
            setAssetsLoaded(true);
        });
    }, [assetPaths, internalAssets, scene]);

    return { assetsLoaded, assets };
};
