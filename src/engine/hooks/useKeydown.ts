import { useContext, useEffect, useRef, useState } from 'react';
import { useBeforeRender } from 'react-babylonjs';
import { ControlsContext, keyObject } from '../containers/ControlsContext';

export const useKeydown = (key: string, onKeydown: () => void) => {
    const keyDown = useRef(keyObject.metaDownKeys[key]);

    useBeforeRender(() => {
        if (keyObject.metaDownKeys[key]) {
            if (keyDown.current === false) {
                onKeydown();
            }
            keyDown.current = true;
        } else {
            keyDown.current = false;
        }
    });
};

export const useKeyup = (key: string, onKeyup: () => void) => {
    const keyDown = useRef(keyObject.metaDownKeys[key]);
    useBeforeRender(() => {
        if (keyObject.metaDownKeys[key]) {
            keyDown.current = true;
        } else {
            if (keyDown.current === true) {
                onKeyup();
            }
            keyDown.current = false;
        }
    });
};

export const useKeydownMenu = (key: string, onKeydown: () => void) => {
    const { downKeys } = useContext(ControlsContext);
    const [keyDown, setKeyDown] = useState(downKeys[key]);

    useEffect(() => {
        if (downKeys[key]) {
            if (keyDown === false) {
                onKeydown();
            }
            setKeyDown(true);
        } else {
            setKeyDown(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [downKeys]);
};

export const useKeyupMenu = (key: string, onKeyup: () => void) => {
    const { downKeys } = useContext(ControlsContext);
    const [keyDown, setKeyDown] = useState(downKeys[key]);
    useEffect(() => {
        if (downKeys[key]) {
            setKeyDown(true);
        } else {
            if (keyDown === true) {
                onKeyup();
            }
            setKeyDown(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [downKeys]);
};
