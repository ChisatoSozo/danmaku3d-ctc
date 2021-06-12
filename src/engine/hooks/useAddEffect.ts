import { useContext } from 'react';
import { EffectContext } from '../containers/EffectContext';

export const useAddEffect = () => {
    const { addEffect } = useContext(EffectContext);
    return addEffect;
};
