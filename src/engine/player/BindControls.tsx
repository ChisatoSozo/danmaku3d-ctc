import { useContext, useEffect } from 'react';
import { useEngine } from 'react-babylonjs';
import { ControlsContext } from '../containers/ControlsContext';

export const BindControls = () => {
    const engine = useEngine();
    const { keyDownHandler, keyUpHandler } = useContext(ControlsContext);

    useEffect(() => {
        const canvas = engine?.getRenderingCanvas();
        if (!canvas) return;

        canvas.addEventListener('keyup', keyUpHandler);
        canvas.addEventListener('keydown', keyDownHandler);
        canvas.addEventListener('pointerup', keyUpHandler);
        canvas.addEventListener('pointerdown', keyDownHandler);

        return () => {
            canvas.removeEventListener('keyup', keyUpHandler);
            canvas.removeEventListener('keydown', keyDownHandler);
            canvas.addEventListener('pointerup', keyUpHandler);
            canvas.addEventListener('pointerdown', keyDownHandler);
        };
    }, [engine, keyDownHandler, keyUpHandler]);

    return null;
};
