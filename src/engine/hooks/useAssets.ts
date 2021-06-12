import { useContext } from 'react';
import { AssetContext } from '../containers/AssetContext';

export const useAssets = () => {
    return useContext(AssetContext).assets;
};
