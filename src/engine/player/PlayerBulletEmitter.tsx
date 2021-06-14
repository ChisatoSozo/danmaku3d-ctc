import { Animation, Space, TransformNode, Vector3 } from '@babylonjs/core';
import React, { ElementType, useEffect, useMemo, useRef, useState } from 'react';
import { useBeforeRender } from 'react-babylonjs';
import { useKeydown, useKeyup } from '../hooks/useKeydown';
import { globalActorRefs } from '../RefSync';

interface PlayerBulletEmitterProps {
    MeshComponent: React.FC | ElementType;
    side: 'left' | 'right';
}

export const PlayerBulletEmitter: React.FC<PlayerBulletEmitterProps> = ({ MeshComponent, side }) => {
    const name = `${side}Emitter`;
    const transformNodeRef = useRef<TransformNode>();

    const sideCoefficient = useMemo(() => (side === 'right' ? 1 : -1), [side]);
    const meshPosition = useMemo(() => new Vector3(sideCoefficient, 0, 0), [sideCoefficient]);
    const focusPosition = useMemo(() => new Vector3(sideCoefficient * 0.5, 0, 0), [sideCoefficient]);
    const unfocusPosition = useMemo(() => new Vector3(sideCoefficient, 0, 0), [sideCoefficient]);
    const [focused, setFocused] = useState(false);

    useBeforeRender(() => {
        if (!globalActorRefs.target || !transformNodeRef.current) return;

        transformNodeRef.current.lookAt(globalActorRefs.target.getAbsolutePosition(), 0, 0, 0, Space.WORLD);
    });

    useKeydown('SLOW', () => {
        setFocused(true);
    });

    useKeyup('SLOW', () => {
        setFocused(false);
    });

    useEffect(() => {
        if (!transformNodeRef.current) return;
        if (focused) {
            Animation.CreateAndStartAnimation(
                'anim',
                transformNodeRef.current,
                'position',
                60,
                15,
                transformNodeRef.current.position,
                focusPosition,
                Animation.ANIMATIONLOOPMODE_CONSTANT,
            );
        } else {
            Animation.CreateAndStartAnimation(
                'anim',
                transformNodeRef.current,
                'position',
                60,
                15,
                transformNodeRef.current.position,
                unfocusPosition,
                Animation.ANIMATIONLOOPMODE_CONSTANT,
            );
        }
    }, [focusPosition, focused, unfocusPosition]);

    return (
        <transformNode ref={transformNodeRef} position={meshPosition} name={name + 'offset'}>
            <MeshComponent />
        </transformNode>
    );
};
