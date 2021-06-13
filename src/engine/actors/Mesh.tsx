import { TransformNode } from '@babylonjs/core';
import React, { useEffect, useRef } from 'react';
import { useModel } from '../hooks/useModel';
import { TransformNodeProps } from '../types/simplified-react-babylon-js';

interface MeshProps {
    modelName: string;
}

export const Mesh: React.FC<TransformNodeProps & MeshProps> = ({ modelName, ...props }) => {
    const transformNodeRef = useRef<TransformNode>();
    const model = useModel(modelName);

    useEffect(() => {
        if (!model?.mesh) return;
        if (!transformNodeRef.current) return;
        model.mesh.parent = transformNodeRef.current;
    }, [model]);

    return <transformNode ref={transformNodeRef} {...props} />;
};
