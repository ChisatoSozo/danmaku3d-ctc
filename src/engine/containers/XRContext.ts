import { WebXRAbstractMotionController, WebXRDefaultExperience, WebXREnterExitUIButton } from '@babylonjs/core';
import React, { useEffect, useRef, useState } from 'react';
import { useBeforeRender, useScene } from 'react-babylonjs';
import { keyObject } from './ControlsContext';

interface IXRContext {
    xr?: WebXRDefaultExperience;
}

export const XRContext = React.createContext<IXRContext>({});

export const useXRContext = (xrEnabled: boolean) => {
    const scene = useScene();
    const [xr, setXr] = useState<WebXRDefaultExperience>();
    const [motionControllers, setMotionControllers] = useState<WebXRAbstractMotionController[]>([]);
    const inXR = useRef(false);

    useEffect(() => {
        if (!xrEnabled) return;
        const createXR = async () => {
            if (!scene) return;

            const div = document.createElement('div');
            div.style.width = '100vw';
            div.style.height = '100vh';
            div.style.position = 'absolute';
            div.style.top = '0px';
            div.style.left = '0px';
            div.style.zIndex = '11';
            div.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';

            div.addEventListener('click', () => {
                if (!xrHelper) return;
                if (inXR.current) return;
                inXR.current = true;
                div.parentNode?.removeChild(div);
            });

            document.body.appendChild(div);
            const button = new WebXREnterExitUIButton(div, 'immersive-vr', 'local-floor');
            const xrHelper = await scene.createDefaultXRExperienceAsync({
                disableTeleportation: true,
                uiOptions: {
                    customButtons: [button],
                },
            });

            xrHelper.input.onControllerAddedObservable.add((inputSource) => {
                inputSource.onMotionControllerInitObservable.add((motionController) => {
                    const xr_ids = motionController.getComponentIds();
                    if (!xr_ids.includes('xr-standard-thumbstick'))
                        throw new Error('xr-standard-thumbstick not supported by controller');
                    setMotionControllers((motionControllers) => [...motionControllers, motionController]);
                });
            });

            xrHelper.pointerSelection.disableAutoAttach = true;
            setXr(xrHelper);
        };
        createXR();
    }, [scene, xrEnabled]);

    useBeforeRender(() => {
        motionControllers.forEach((motionController) => {
            if (motionController.handedness === 'left') {
                const thumbstick = motionController.getComponent('xr-standard-thumbstick');
                if (thumbstick.axes.x < 1) keyObject.metaDownKeys['LEFT'] = -thumbstick.axes.x;
                if (thumbstick.axes.x > 1) keyObject.metaDownKeys['RIGHT'] = thumbstick.axes.x;
                if (thumbstick.axes.y < 1) keyObject.metaDownKeys['UP'] = -thumbstick.axes.y;
                if (thumbstick.axes.y > 1) keyObject.metaDownKeys['DOWN'] = thumbstick.axes.y;
            }
        });
    });

    return { xr };
};
