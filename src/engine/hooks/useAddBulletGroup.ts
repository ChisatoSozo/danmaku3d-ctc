import { useContext } from 'react';
import { BulletContext } from '../containers/BulletContext';

export const useAddBulletGroup = () => {
    const { addBulletGroup } = useContext(BulletContext);
    return addBulletGroup;
};
