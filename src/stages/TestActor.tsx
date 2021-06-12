import { TransformNode, Vector3 } from '@babylonjs/core';
import React, { useEffect, useRef } from 'react';
import { useAddBulletGroup } from '../engine/hooks/useAddBulletGroup';
import { useDeltaBeforeRender } from '../engine/hooks/useDeltaBeforeRender';

export const TestActor = () => {
    const addBulletGroup = useAddBulletGroup();
    const transformNodeRef = useRef<TransformNode>();

    useEffect(() => {
        if (!transformNodeRef.current) return;
        if (!addBulletGroup) return;
        addBulletGroup(transformNodeRef.current, {
            patternOptions: {
                num: 100,
                repeat: {
                    times: 1000,
                    delay: 0.01,
                },
                speed: 4,
                radius: 2,
            },
            meshOptions: {
                radius: 0.1,
            },
            materialOptions: {
                color: [0, 0, 1],
            },
            behaviourOptions: {
                rotationFromParent: true,
            },
            lifespan: 20,
        });
    }, [addBulletGroup]);

    useDeltaBeforeRender((scene, deltaS) => {
        if (!transformNodeRef.current) return;
        transformNodeRef.current.rotation.x += deltaS * 0.3 * 4;
        transformNodeRef.current.rotation.y += deltaS * 0.3 * 2.646;
        transformNodeRef.current.rotation.z += deltaS * 0.3 * 1.2222;
    });

    return <transformNode position={new Vector3(0, 5, 0)} name="test" ref={transformNodeRef}></transformNode>;
};
