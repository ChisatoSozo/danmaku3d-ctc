import { Animation, Color3, EasingFunction, Mesh, SineEase, Vector3 } from '@babylonjs/core';
import React, { useEffect, useRef } from 'react';
import { useScene } from 'react-babylonjs';
import { useGlowLayer } from '../../engine/hooks/useGlowLayer';
import { useName } from '../../engine/hooks/useName';
import { useTexture } from '../../engine/hooks/useTexture';

const lightBlue = new Color3(0.2, 0.6, 1);
export const EmitterMesh: React.FC = () => {
    const name = useName('emitterMesh');
    const rune1 = useTexture('rune1');
    const glowLayer = useGlowLayer();
    const scene = useScene();

    const planeRef = useRef<Mesh>();
    const smallPlaneRef = useRef<Mesh>();

    useEffect(() => {
        if (!glowLayer || !planeRef.current || !smallPlaneRef.current || !scene) return;
        const plane = planeRef.current;
        const smallPlane = smallPlaneRef.current;
        glowLayer.addIncludedOnlyMesh(plane);
        glowLayer.addIncludedOnlyMesh(smallPlane);
        const sineAnimation = new Animation(
            name + 'sineAnimation',
            'position',
            30,
            Animation.ANIMATIONTYPE_VECTOR3,
            Animation.ANIMATIONLOOPMODE_CYCLE,
        );
        const keysSineAnimation = [];
        keysSineAnimation.push({ frame: 0, value: new Vector3(0, 0, 0.5) });
        keysSineAnimation.push({ frame: 30, value: new Vector3(0, 0, 0.4) });
        keysSineAnimation.push({ frame: 60, value: new Vector3(0, 0, 0.5) });
        sineAnimation.setKeys(keysSineAnimation);

        const cubicEasing = new SineEase();
        cubicEasing.setEasingMode(EasingFunction.EASINGMODE_EASEINOUT);
        sineAnimation.setEasingFunction(cubicEasing);

        smallPlane.animations.push(sineAnimation);
        scene.beginAnimation(smallPlane, 0, 60, true);

        return () => {
            scene.stopAnimation(smallPlane);
            glowLayer.removeIncludedOnlyMesh(plane);
            glowLayer.removeIncludedOnlyMesh(smallPlane);
        };
    }, [glowLayer, name, scene]);

    return (
        <plane name={name + 'plane'} scaling={new Vector3(0.5, 0.5, 0.5)} ref={planeRef}>
            <standardMaterial
                alpha={0.5}
                useAlphaFromDiffuseTexture
                disableLighting={true}
                diffuseTexture={rune1}
                emissiveColor={lightBlue}
                name={name + 'planeMat'}
            />
            <plane
                name={name + 'smallPlane'}
                scaling={new Vector3(0.5, 0.5, 0.5)}
                position={new Vector3(0, 0, 0.5)}
                ref={smallPlaneRef}
            >
                <standardMaterial
                    alpha={0.5}
                    useAlphaFromDiffuseTexture
                    disableLighting={true}
                    diffuseTexture={rune1}
                    emissiveColor={lightBlue}
                    name={name + 'planeMat'}
                />
            </plane>
        </plane>
    );
};
