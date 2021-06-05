import { Texture } from '@babylonjs/core';
import { useContext } from 'react';
import { AssetContext } from '../containers/AssetContext';

export const useTexture: (textureName: string) => Texture | undefined = (textureName: string) => {
    const assets = useContext(AssetContext);
    if (textureName in assets.textures) {
        return assets.textures[textureName];
    }
};
