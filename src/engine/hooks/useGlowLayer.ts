import { useContext } from 'react';
import { GlowContext } from '../containers/GlowContext';

export const useGlowLayer = () => {
    const glowLayer = useContext(GlowContext).glowLayer;
    return glowLayer;
};
