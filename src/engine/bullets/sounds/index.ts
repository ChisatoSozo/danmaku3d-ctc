import LoopingSound from '../../sounds/LoopingSound';
import MultiSound from '../../sounds/MultiSound';
import * as SFX from '../../sounds/SFX';
import { SoundOptions } from '../../types/BulletTypes';
import { filterInPlace } from '../../utils/Utils';

export class EnemySound {
    private soundObj: MultiSound | LoopingSound;
    private reducedTimings: number[];
    private timeSinceStart: number;

    constructor(soundObj: MultiSound | LoopingSound, reducedTimings: number[]) {
        this.soundObj = soundObj;
        this.reducedTimings = reducedTimings;
        this.timeSinceStart = 0;
    }

    update(deltaS: number) {
        this.timeSinceStart += deltaS;

        this.reducedTimings.some((timing) => {
            if (this.timeSinceStart > timing) {
                this.soundObj.play();
                return false;
            }
            return true;
        });

        filterInPlace<number>(this.reducedTimings, (timing) => this.timeSinceStart <= timing);
    }
}

export const makeBulletSound = (soundOptions: SoundOptions, timings: number[]) => {
    const reducedTimings = [...new Set(timings)].sort((a, b) => a - b);

    //@ts-ignore
    const soundObj: MultiSound | LoopingSound = SFX[soundOptions.sound];

    return new EnemySound(soundObj, reducedTimings);
};
