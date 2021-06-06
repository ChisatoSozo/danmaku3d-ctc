import { Scene } from '@babylonjs/core';

export interface PausableScene extends Scene {
    paused: boolean;
}
