import { InitArgs } from './BulletBehaviour';
import { EnemyBulletBehaviour, EnemyBulletBehaviourArgs } from './EnemyBulletBehaviour';

export const BULLET_TYPE: { [key: string]: BulletType } = {
    BULLET: 0,
    LIFE: 1,
    BOMB: 2,
    POWER: 3,
    POINT: 4,
    SPECIAL: 5,
};

export type BulletType = 0 | 1 | 2 | 3 | 4 | 5;

export interface LaserInitArgs extends InitArgs {
    laserLength: number;
}

export class EnemyLaserBehaviour extends EnemyBulletBehaviour {
    constructor(args: EnemyBulletBehaviourArgs) {
        super(args);
        this.collisionShader = 'enemyLaserCollision';
    }

    init(args: LaserInitArgs) {
        super.init(args);
        args.material.setFloat('laserLength', args.laserLength);
        this.diffSystem?.collisionTextures.forEach((texture) => {
            texture.setFloat('laserLength', args.laserLength);
        });
    }
}
