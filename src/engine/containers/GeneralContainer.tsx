import React from 'react';
import { AssetContext, useAssetContext } from './AssetContext';



interface GeneralContainerProps {
    assetPaths: string[]
}

export const GeneralContainer: React.FC<GeneralContainerProps> = ({ children, assetPaths }) => {

    const assets = useAssetContext(assetPaths);

    return (
        <AssetContext.Provider value={assets}>
            {children}
        </AssetContext.Provider>
    )
}
