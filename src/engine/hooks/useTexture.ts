import { Texture } from '@babylonjs/core';
import { useAssets } from './useAssets';

export const useTexture: (textureName: string) => Texture | undefined = (textureName: string) => {
    const assets = useAssets();
    if (textureName in assets.textures) {
        return assets.textures[textureName];
    }
};
