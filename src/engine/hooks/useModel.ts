import { AnimationGroup, Node, Skeleton } from '@babylonjs/core';
import { useAssets } from './useAssets';

interface Model {
    mesh: Node;
    animationGroups: AnimationGroup[];
    animationSkeleton: Skeleton | undefined;
}
type useModelType = (modelName: string, extractChild?: boolean) => Model | undefined;
export const useModel: useModelType = (modelName, extractChild = false) => {
    const assets = useAssets();
    if (modelName in assets.containers) {
        const container = assets.containers[modelName];
        if (!container) return;
        const newInstance = container.instantiateModelsToScene();
        const mesh = extractChild ? newInstance.rootNodes[0].getChildren()[0] : newInstance.rootNodes[0];
        const animationGroups = newInstance.animationGroups;
        const animationSkeleton = newInstance.skeletons.length ? newInstance.skeletons[0] : undefined;

        return {
            mesh,
            animationGroups,
            animationSkeleton,
        };
    }
    return;
};
