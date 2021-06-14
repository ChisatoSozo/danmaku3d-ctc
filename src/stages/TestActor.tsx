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
                num: 5,
                repeat: {
                    times: 5000,
                    delay: 0.02,
                },
                speed: 0.001,
                radius: 0.5,
            },
            meshOptions: {
                mesh: 'laser',
                radius: 0.1,
                laserLength: 40,
            },
            materialOptions: {
                material: 'laser',
                color: [1, 0, 0],
                glow: false,
            },
            behaviourOptions: {
                behaviour: 'linearLaser',
                rotationFromParent: true,
            },
            endTimingOptions: {
                timing: 'uniform',
                time: 2,
            },
            lifespan: 50,
        });
        addBulletGroup(transformNodeRef.current, {
            patternOptions: {
                num: 300,
                repeat: {
                    times: 5,
                    delay: 3,
                },
                speed: 2,
                radius: 0.5,
            },
            meshOptions: {
                radius: 0.3,
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
