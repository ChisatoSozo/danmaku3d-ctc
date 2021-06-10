import { Vector3 } from '@babylonjs/core';
import { CustomFloatProceduralTexture } from '../../forks/CustomFloatProceduralTexture';
import { globalActorRefs } from '../../RefSync';
import { BulletBehaviour, BulletBehaviourArgs } from './BulletBehaviour';

export const BULLET_TYPE: { [key: string]: BulletType } = {
    BULLET: 0,
    LIFE: 1,
    BOMB: 2,
    POWER: 3,
    POINT: 4,
    SPECIAL: 5,
};

export type BulletType = 0 | 1 | 2 | 3 | 4 | 5;

interface EnemyBulletBehaviourArgs extends BulletBehaviourArgs {
    bulletType: BulletType;
}

export class EnemyBulletBehaviour extends BulletBehaviour {
    private bulletType: BulletType;

    constructor({
        bulletType,
        positionShader,
        velocityShader,
        collideWithEnvironment,
        parent,
        radius = 1,
        bulletValue = 1,
        initialValuesFunction: _initialValuesFunction,
    }: EnemyBulletBehaviourArgs) {
        super({
            positionShader,
            velocityShader,
            collideWithEnvironment,
            parent,
            radius,
            bulletValue,
            initialValuesFunction: (texture) => {
                if (_initialValuesFunction) _initialValuesFunction(texture);
                texture.setFloats('bombPositions', globalActorRefs.bombPositionBuffer);
                texture.setFloats('bombRadii', globalActorRefs.bombRadiiBuffer);
            },
        });
        this.collisionShader = 'enemyBulletCollision';
        this.bulletType = bulletType;
    }

    update(deltaS: number) {
        return super.update(deltaS);
    }

    bindCollisionVars = (texture: CustomFloatProceduralTexture) => {
        super.bindCollisionVars(texture);

        const typeVector1 = new Vector3(0, 0, 0);
        const typeVector2 = new Vector3(0, 0, 0);

        switch (this.bulletType) {
            case 0:
                typeVector1.x = this.bulletValue;
                break; //bullet
            case 1:
                typeVector1.y = this.bulletValue;
                break; //life
            case 2:
                typeVector1.z = this.bulletValue;
                break; //bomb
            case 3:
                typeVector2.x = this.bulletValue;
                break; //power
            case 4:
                typeVector2.y = this.bulletValue;
                break; //point
            case 5:
                typeVector2.z = this.bulletValue;
                break; //special
            default:
                throw new Error('Invalid bullet type ' + this.bulletType);
        }
        const radius = this.radius;

        texture.setVector3('bulletTypePack1', typeVector1);
        texture.setVector3('bulletTypePack2', typeVector2);
        texture.setFloat('bulletRadius', radius);
        texture.setVector3('playerPosition', globalActorRefs.player.position);
        texture.setFloats('bombPositions', globalActorRefs.bombPositionBuffer);
        texture.setFloats('bombRadii', globalActorRefs.bombRadiiBuffer);
    };
}
