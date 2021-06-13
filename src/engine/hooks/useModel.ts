import { AnimationGroup, Skeleton, TransformNode } from '@babylonjs/core';
import { useMemo } from 'react';
import { Assets } from '../containers/AssetContext';
import { useAssets } from './useAssets';

interface Model {
    mesh: TransformNode;
    animationGroups: AnimationGroup[];
    animationSkeleton: Skeleton | undefined;
}
type useModelType = (modelName: string, extractChild?: boolean) => Model | undefined;
type getModelType = (assets: Assets, modelName: string, extractChild?: boolean) => Model | undefined;

export const getModel: getModelType = (assets, modelName, extractChild = false) => {
    if (modelName in assets.containers) {
        const container = assets.containers[modelName];
        if (!container) return;
        const newInstance = container.instantiateModelsToScene();
        const mesh = (extractChild ? newInstance.rootNodes[0].getChildren()[0] : newInstance.rootNodes[0]) as TransformNode;
        mesh.parent = null;
        const animationGroups = newInstance.animationGroups;
        const animationSkeleton = newInstance.skeletons.length ? newInstance.skeletons[0] : undefined;

        return {
            mesh,
            animationGroups,
            animationSkeleton,
        };
    }
};

export const useModel: useModelType = (modelName, extractChild = false) => {
    const assets = useAssets();
    const model = useMemo(() => {
        if (modelName in assets.containers) {
            const container = assets.containers[modelName];
            if (!container) return;
            const newInstance = container.instantiateModelsToScene();
            const mesh = (extractChild ? newInstance.rootNodes[0].getChildren()[0] : newInstance.rootNodes[0]) as TransformNode;
            const animationGroups = newInstance.animationGroups;
            const animationSkeleton = newInstance.skeletons.length ? newInstance.skeletons[0] : undefined;

            return {
                mesh,
                animationGroups,
                animationSkeleton,
            };
        }
    }, [assets, extractChild, modelName]);

    return model;
};
