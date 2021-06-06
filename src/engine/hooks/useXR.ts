import { useContext } from 'react';
import { XRContext } from '../containers/XRContext';

export const useXR = () => {
    const { xr } = useContext(XRContext);
    return xr;
};
