import { useMemo } from 'react';
import { v4 as uuid } from 'uuid';

export const useName = (prefix: string) => {
    return useMemo(() => (prefix || '') + uuid(), [prefix]);
};

export const makeName = (prefix: string) => {
    return (prefix || '') + uuid();
};
