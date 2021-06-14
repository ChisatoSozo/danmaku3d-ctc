import { ElementType } from 'react';

export interface PlayerType {
    name: string;
    emitter: {
        MeshComponent: React.FC | ElementType;
    };
}
