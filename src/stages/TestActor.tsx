import { TransformNode, Vector3 } from '@babylonjs/core';
import React, { useEffect, useRef } from 'react';
import { useAddBulletGroup } from '../engine/hooks/useAddBulletGroup';

export const TestActor = () => {
    const addBulletGroup = useAddBulletGroup();
    const transformNodeRef = useRef<TransformNode>();

    useEffect(() => {
        if (!transformNodeRef.current) return;
        if (!addBulletGroup) return;
        addBulletGroup(transformNodeRef.current, {});
    }, [addBulletGroup]);

    return <transformNode position={new Vector3(0, 5, 0)} name="test" ref={transformNodeRef}></transformNode>;
};
