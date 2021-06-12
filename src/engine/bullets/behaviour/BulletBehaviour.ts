import { Scene, ShaderMaterial, Texture, TransformNode, Vector3 } from '@babylonjs/core';
import { CustomFloatProceduralTexture } from '../../forks/CustomFloatProceduralTexture';
import { globalActorRefs } from '../../RefSync';
import { BulletCache } from '../../types/BulletTypes';
import { makeTextureFromArray, makeTextureFromBlank, makeTextureFromVectors } from '../../utils/BulletUtils';
import { ARENA_MAX, ARENA_MIN } from '../../utils/Constants';
import DifferentialPositionVelocityCollisionSystem from './DifferentialPositionVelocityCollisionSystem';

export interface BulletBehaviourArgs {
    positionShader: string;
    velocityShader: string;
    collideWithEnvironment: Vector3;
    parent: TransformNode;
    initialValuesFunction?: (texture: CustomFloatProceduralTexture) => void;
    radius?: number;
    bulletValue?: number;
}

interface InitArgs {
    material: ShaderMaterial;
    initialPositions: Vector3[] | CustomFloatProceduralTexture;
    initialVelocities: Vector3[] | CustomFloatProceduralTexture;
    timings: number[];
    endTimings: number[];
    downsampleCollisions: boolean;
    translationFromParent?: boolean;
    rotationFromParent?: boolean;
    disableWarning?: boolean;
    uid: string;
    bulletCache: BulletCache;
    scene: Scene;
}

export class BulletBehaviour {
    private positionShader: string;
    private velocityShader: string;
    protected collisionShader?: string;
    private collideWithEnvironment: Vector3;
    private parent: TransformNode;
    protected radius: number;
    protected bulletValue: number;
    private initialValuesFunction?: (texture: CustomFloatProceduralTexture) => void;
    private diffSystem?: DifferentialPositionVelocityCollisionSystem;

    private material?: ShaderMaterial;
    private ready: boolean;
    private timeSinceStart?: number;

    constructor({
        positionShader,
        velocityShader,
        collideWithEnvironment,
        parent,
        radius = 1,
        bulletValue = 1,
        initialValuesFunction,
    }: BulletBehaviourArgs) {
        if (!collideWithEnvironment.x) {
            throw new Error('collideWithEnvironment must be a vector');
        }

        this.parent = parent;
        this.positionShader = positionShader;
        this.velocityShader = velocityShader;
        this.collideWithEnvironment = collideWithEnvironment;
        this.radius = radius;
        this.bulletValue = bulletValue;
        this.ready = false;

        this.initialValuesFunction = initialValuesFunction;
    }

    bindCollisionVars(texture: CustomFloatProceduralTexture) {
        texture.setVector3('arenaMin', ARENA_MIN);
        texture.setVector3('arenaMax', ARENA_MAX);
        texture.setVector3('collideWithEnvironment', this.collideWithEnvironment);
    }

    init({
        material,
        initialPositions,
        initialVelocities,
        timings,
        endTimings,
        downsampleCollisions,
        translationFromParent = true,
        rotationFromParent = false,
        disableWarning = false,
        uid,
        bulletCache,
        scene,
    }: InitArgs) {
        if (!this.collisionShader) throw new Error('Collision shader must be set by child of BulletBehaviour');

        const num = timings.length;
        const startPositionsState =
            bulletCache.textureCache[uid]?.positions || makeTextureFromBlank(timings.length, scene, 1, -510, -510); //All positions are invalid until enter time
        const startCollisionsState = bulletCache.textureCache[uid]?.collisions || makeTextureFromBlank(timings.length, scene, 0, 0); //No collisions
        const startVelocitiesState = bulletCache.textureCache[uid]?.velocities || makeTextureFromBlank(timings.length, scene, 0, 0);

        const initialPositionsTexture =
            bulletCache.textureCache[uid]?.initialPositions ||
            (initialPositions instanceof Texture ? initialPositions : makeTextureFromVectors(initialPositions, scene, 1, -510));
        const initialVelocitiesTexture =
            bulletCache.textureCache[uid]?.initialVelocities ||
            (initialVelocities instanceof Texture ? initialVelocities : makeTextureFromVectors(initialVelocities, scene, 1, 0));
        const timingsTexture = bulletCache.textureCache[uid]?.timings || makeTextureFromArray(timings, scene);
        const endTimingsTexture = bulletCache.textureCache[uid]?.endTimings || makeTextureFromArray(endTimings, scene);

        this.diffSystem = new DifferentialPositionVelocityCollisionSystem({
            num,
            startPositionsState,
            //TODO: here
            startVelocitiesState: initialVelocitiesTexture, //startVelocitiesState
            startCollisionsState,
            positionShader: this.positionShader,
            velocityShader: this.velocityShader,
            collisionShader: this.collisionShader,
            downsampleCollisions,
            scene,
            initialValuesFunction: (texture) => {
                texture.setTexture('initialPositionSampler', initialPositionsTexture);

                //TODO: here
                //texture.setTexture('initialVelocitySampler', initialVelocitiesTexture);
                texture.setTexture('timingsSampler', timingsTexture);
                texture.setTexture('endTimingsSampler', endTimingsTexture);
                texture.setVector3('playerPosition', globalActorRefs.player.position);
                texture.setVector3('parentPosition', this.parent.getAbsolutePosition());
                texture.setFloat('translationFromParent', +translationFromParent);
                texture.setFloat('rotationFromParent', +rotationFromParent);
                texture.setFloat('timeSinceStart', 0.001);
            },
            initialPositionValuesFunction: this.initialValuesFunction,
            initialVelocityValuesFunction: this.initialValuesFunction,
            initialCollisionValuesFunction: this.bindCollisionVars,
        });

        material.setTexture('positionSampler', startPositionsState);
        //TODO: here
        material.setTexture('velocitySampler', initialVelocitiesTexture); //startVelocitiesState
        material.setTexture('collisionSampler', startCollisionsState);
        material.setTexture('timingsSampler', timingsTexture);
        material.setTexture('endTimingsSampler', endTimingsTexture);
        material.setFloat('timeSinceStart', 0.001);
        material.setFloat('radius', this.radius);
        material.setFloat('disableWarning', +disableWarning);

        this.material = material;
        this.ready = true;
        this.timeSinceStart = 0.001;
    }
    dispose() {
        if (!this.diffSystem) throw new Error('diffSystem was not initialized');
        this.diffSystem.dispose();
        this.ready = false;
    }
    update(deltaS: number) {
        if (!this.ready || !this.diffSystem || !this.timeSinceStart || !this.material) {
            return false;
        }

        this.timeSinceStart += deltaS;

        const updateResult = this.diffSystem.update(deltaS, (texture) => {
            if (!this.timeSinceStart) throw new Error('Time since start was not initialized when trying to update');
            texture.setVector3('parentPosition', this.parent.getAbsolutePosition());
            texture.setFloat('timeSinceStart', this.timeSinceStart);
            texture.setVector3('playerPosition', globalActorRefs.player.position);
        });

        if (!updateResult) return updateResult;

        const [newPositions, newVelocities, newCollisions] = updateResult;

        this.material.setTexture('positionSampler', newPositions);
        this.material.setTexture('velocitySampler', newVelocities);
        this.material.setTexture('collisionSampler', newCollisions);
        this.material.setFloat('timeSinceStart', this.timeSinceStart);

        return updateResult;
    }
}
