import { TransformNode, Vector3 } from '@babylonjs/core';
import React, { useRef } from 'react';
import { keyObject } from '../containers/ControlsContext';
import { useDeltaBeforeRender } from '../hooks/useDeltaBeforeRender';
import { ARENA_FLOOR, ARENA_HEIGHT, ARENA_LENGTH, ARENA_WIDTH, LATERAL_SPEED } from '../utils/Constants';

export const PlayerMovement: React.FC = ({ children }) => {
    const transformNodeRef = useRef<TransformNode>();

    useDeltaBeforeRender((scene, deltaS) => {
        if (!transformNodeRef.current) return;

        const UP = keyObject.metaDownKeys['UP'];
        const DOWN = keyObject.metaDownKeys['DOWN'];
        const LEFT = keyObject.metaDownKeys['LEFT'];
        const RIGHT = keyObject.metaDownKeys['RIGHT'];
        const SLOW = keyObject.metaDownKeys['SLOW'];

        const position = transformNodeRef.current.position;

        const slowFactor = SLOW ? 0.5 : 1;

        if (UP) position.addInPlace(Vector3.Up().scale(deltaS * LATERAL_SPEED * slowFactor * +UP));
        if (DOWN) position.addInPlace(Vector3.Down().scale(deltaS * LATERAL_SPEED * slowFactor * +DOWN));
        if (LEFT) position.addInPlace(Vector3.Left().scale(deltaS * LATERAL_SPEED * slowFactor * +LEFT));
        if (RIGHT) position.addInPlace(Vector3.Right().scale(deltaS * LATERAL_SPEED * slowFactor * +RIGHT));

        if (position.x > ARENA_WIDTH / 2) position.x = ARENA_WIDTH / 2;
        if (position.x < -ARENA_WIDTH / 2) position.x = -ARENA_WIDTH / 2;
        if (position.y > ARENA_HEIGHT) position.y = ARENA_HEIGHT;
        if (position.y < ARENA_FLOOR) position.y = ARENA_FLOOR;
    });

    return (
        <transformNode ref={transformNodeRef} name="playerTransform" position={new Vector3(0, 5, -ARENA_LENGTH / 2)}>
            {children}
        </transformNode>
    );
};
