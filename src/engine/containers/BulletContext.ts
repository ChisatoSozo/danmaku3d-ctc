import { GlowLayer, Mesh, ShaderMaterial, TransformNode, Vector3 } from '@babylonjs/core';
import { isFunction } from 'lodash';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import { useScene } from 'react-babylonjs';
import { v4 as uuid } from 'uuid';
import { makeBulletBehaviour } from '../bullets/behaviour';
import { BulletBehaviour } from '../bullets/behaviour/BulletBehaviour';
import { BULLET_TYPE } from '../bullets/behaviour/EnemyBulletBehaviour';
import { EnemyLaserBehaviour } from '../bullets/behaviour/EnemyLaserBehaviour';
import { PlayerBulletBehaviour } from '../bullets/behaviour/PlayerBulletBehaviour';
import { makeEndTimings } from '../bullets/endTimings';
import { makeBulletMaterial } from '../bullets/materials';
import { makeBulletMesh } from '../bullets/mesh';
import { makeBulletPattern } from '../bullets/patterns';
import { EnemySound, makeBulletSound } from '../bullets/sounds';
import { CustomFloatProceduralTexture } from '../forks/CustomFloatProceduralTexture';
import { useDeltaBeforeRender } from '../hooks/useDeltaBeforeRender';
import { makeName } from '../hooks/useName';
import { globalActorRefs } from '../RefSync';
import { itemGet, playerDeath, playerGraze } from '../sounds/SFX';
import { BulletCache, BulletInstruction, PreBulletInstruction, UnevalBulletInstruction } from '../types/BulletTypes';
import { DeepPartial } from '../types/UtilTypes';
import { convertEnemyBulletCollisions, convertPlayerBulletCollisions } from '../utils/BulletUtils';
import { MAX_BULLETS_PER_GROUP, MAX_ENEMIES, PLAYER_INVULNERABLE_COOLDOWN } from '../utils/Constants';
import { IAssetContext } from './AssetContext';
import { IEffectContext } from './EffectContext';
import { LS } from './LSContext';

const defaultBulletInstruction: UnevalBulletInstruction = {
    materialOptions: {
        material: 'fresnel',
        color: [1, 0, 0],
        doubleSided: false,
        uid: '',
    },
    patternOptions: {
        pattern: 'burst',
        num: 100,
        speed: 1,
        radius: 1,
        disablePrecomputation: false,
        uid: '',
    },
    endTimingOptions: {
        timing: 'lifespan',
        disablePrecomputation: false,
        uid: '',
    },
    meshOptions: {
        mesh: 'sphere',
        radius: 1,
        uid: '',
    },
    behaviourOptions: {
        behaviour: 'linear',
        bulletValue: 1,
        bulletType: BULLET_TYPE.BULLET,
        translationFromParent: true,
        rotationFromParent: false,
        disableWarning: false,
        uid: '',
    },
    soundOptions: {
        mute: false,
        sound: 'enemyShoot',
        uid: '',
    },
    uid: '',
    lifespan: 10,
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const evalOption = (option: { [key: string]: any }) => {
    for (const key in option) {
        if (isFunction(option[key])) {
            option[key] = option[key](LS.DIFFICULTY_NUMBER);
        }
    }
};

const prepareBulletInstruction = (instruction: DeepPartial<PreBulletInstruction>) => {
    const newInstruction: DeepPartial<UnevalBulletInstruction> = isFunction(instruction)
        ? instruction(LS.DIFFICULTY_NUMBER)
        : instruction;

    if (!newInstruction) throw new Error('Instruction ended up being undefined or null');
    if (!newInstruction.materialOptions) newInstruction.materialOptions = {};
    if (!newInstruction.patternOptions) newInstruction.patternOptions = {};
    if (!newInstruction.endTimingOptions) newInstruction.endTimingOptions = {};
    if (!newInstruction.meshOptions) newInstruction.meshOptions = {};
    if (!newInstruction.behaviourOptions) newInstruction.behaviourOptions = {};
    if (!newInstruction.soundOptions) newInstruction.soundOptions = {};
    newInstruction.materialOptions = { ...defaultBulletInstruction.materialOptions, ...newInstruction.materialOptions };
    newInstruction.patternOptions = { ...defaultBulletInstruction.patternOptions, ...newInstruction.patternOptions };
    newInstruction.endTimingOptions = { ...defaultBulletInstruction.endTimingOptions, ...newInstruction.endTimingOptions };
    newInstruction.meshOptions = { ...defaultBulletInstruction.meshOptions, ...newInstruction.meshOptions };
    newInstruction.behaviourOptions = { ...defaultBulletInstruction.behaviourOptions, ...newInstruction.behaviourOptions };
    newInstruction.soundOptions = { ...defaultBulletInstruction.soundOptions, ...newInstruction.soundOptions };
    evalOption(newInstruction.materialOptions);
    evalOption(newInstruction.patternOptions);
    evalOption(newInstruction.endTimingOptions);
    evalOption(newInstruction.meshOptions);
    evalOption(newInstruction.behaviourOptions);
    evalOption(newInstruction.soundOptions);
    evalOption(newInstruction);

    const uid = newInstruction.uid || uuid();
    newInstruction.materialOptions.uid = uid;
    newInstruction.patternOptions.uid = uid;
    newInstruction.endTimingOptions.uid = uid;
    newInstruction.meshOptions.uid = uid;
    newInstruction.behaviourOptions.uid = uid;
    newInstruction.soundOptions.uid = uid;

    newInstruction.lifespan = newInstruction.lifespan || defaultBulletInstruction.lifespan;

    return newInstruction as BulletInstruction;
};

const bufferMatricesPreCompute = new Float32Array(MAX_BULLETS_PER_GROUP * 16);

const makeInstances = (mesh: Mesh, num: number) => {
    if (num > MAX_BULLETS_PER_GROUP) throw new Error('MAX_BULLETS_PER_GROUP is ' + MAX_BULLETS_PER_GROUP + ' You have ' + num);
    mesh.thinInstanceSetBuffer('matrix', bufferMatricesPreCompute.slice(0, num * 16), 16, true);
};

type AddBulletGroup = (
    parent: TransformNode,
    instruction: DeepPartial<PreBulletInstruction>,
    sourceBulletId?: string,
    supressNotPrecomputedWarning?: boolean,
) => string;

interface IBulletContext {
    addBulletGroup: AddBulletGroup | undefined;
    isDead: boolean;
}

const defaultBulletContext: () => IBulletContext = () => ({
    addBulletGroup: () => '',
    isDead: false,
});
interface BulletGroup {
    behaviour: BulletBehaviour;
    mesh: Mesh;
    material: ShaderMaterial;
    initialPositions: Vector3[] | CustomFloatProceduralTexture;
    initialVelocities: Vector3[];
    timings: number[];
    endTimings: number[];
    translationFromParent: boolean;
    rotationFromParent: boolean;
    disableWarning: boolean;
    glow: boolean | undefined;
    instruction: BulletInstruction;

    lifespan: number;
    timeSinceStart: number;
    sounds: EnemySound | false;
}
interface BulletGroupMap {
    [key: string]: BulletGroup;
}

const bulletGroupDispose = (group: BulletGroup, glowLayer: GlowLayer) => {
    if (group.glow) {
        glowLayer.unReferenceMeshFromUsingItsOwnMaterial(group.mesh);
    }
    group.material.dispose();
    group.behaviour.dispose();
    group.mesh.dispose();
};

export const BulletContext = React.createContext<IBulletContext>(defaultBulletContext());

export const useBulletContext = (
    assetContext: IAssetContext,
    effects: IEffectContext,
    glowLayer: GlowLayer,
    environmentCollision: Vector3,
) => {
    const scene = useScene();
    const playHitSound = useRef(false);
    const playerInvulnerable = useRef(false);
    const { assets, assetsLoaded } = assetContext;
    const { addEffect } = effects;

    const [isDead, setIsDead] = useState(false);

    const bulletCache = useMemo<BulletCache>(
        () => ({
            textureCache: {},
            patterns: {},
            endTimings: {},
        }),
        [],
    );

    const allBullets = useMemo<BulletGroupMap>(() => ({}), []);

    const dispose = useCallback(
        (ids: string[]) => {
            ids.forEach((id) => {
                bulletGroupDispose(allBullets[id], glowLayer);
                delete allBullets[id];
            });
        },
        [allBullets, glowLayer],
    );

    const addBulletGroup = useMemo(() => {
        if (!assetsLoaded) return;
        return (
            parent: TransformNode,
            instruction: DeepPartial<PreBulletInstruction>,
            sourceBulletId?: string,
            supressNotPrecomputedWarning = false,
        ) => {
            if (!parent) throw new Error('parent not ready!');
            if (!scene) throw new Error('scene not ready!');
            const preparedInstruction = prepareBulletInstruction(instruction);
            if (!preparedInstruction) throw new Error('Instruction could not be prepared');
            if (sourceBulletId) preparedInstruction.patternOptions.sourceBulletId = sourceBulletId;

            const {
                positions: initialPositions,
                velocities: initialVelocities,
                timings,
                uid,
            } = makeBulletPattern(preparedInstruction.patternOptions, bulletCache, scene, supressNotPrecomputedWarning);

            const mesh = makeBulletMesh(preparedInstruction.meshOptions, assets, scene);
            const behaviour = makeBulletBehaviour(
                preparedInstruction.behaviourOptions,
                environmentCollision,
                preparedInstruction.meshOptions.radius,
                parent,
            );
            const endTimings = makeEndTimings(
                preparedInstruction.endTimingOptions,
                timings.length,
                preparedInstruction.lifespan,
                bulletCache,
                scene,
            );
            const sounds =
                preparedInstruction.soundOptions &&
                !preparedInstruction.soundOptions.mute &&
                makeBulletSound(preparedInstruction.soundOptions, timings);

            makeInstances(mesh, timings.length);

            const material = makeBulletMaterial(preparedInstruction.materialOptions, assets, scene);
            const glow = preparedInstruction.materialOptions.glow;
            if (preparedInstruction.materialOptions.glow) {
                glowLayer.referenceMeshToUseItsOwnMaterial(mesh);
            }
            mesh.material = material;

            const translationFromParent = preparedInstruction.behaviourOptions.translationFromParent;
            const rotationFromParent = preparedInstruction.behaviourOptions.rotationFromParent;
            const disableWarning = preparedInstruction.behaviourOptions.disableWarning || false;

            const behaviourInitArgs = {
                material,
                initialPositions,
                initialVelocities,
                timings,
                endTimings,
                translationFromParent,
                rotationFromParent,
                disableWarning,
                uid,
                bulletCache,
                scene,
            };

            if (behaviour instanceof EnemyLaserBehaviour) {
                if (!preparedInstruction.meshOptions.laserLength) throw new Error('mesh is laser, but no laserLength specified');
                behaviour.init({
                    ...behaviourInitArgs,
                    laserLength: preparedInstruction.meshOptions.laserLength,
                });
            } else {
                behaviour.init(behaviourInitArgs);
            }

            const { lifespan } = preparedInstruction;
            const timeSinceStart = 0;

            const bulletGroup = {
                behaviour,
                mesh,
                material,
                initialPositions,
                initialVelocities,
                timings,
                endTimings,
                translationFromParent,
                rotationFromParent,
                disableWarning,
                glow,
                instruction: preparedInstruction,
                lifespan,
                timeSinceStart,
                sounds,
            };

            const newID = makeName('bulletGroup');
            allBullets[newID] = bulletGroup;
            return newID;
        };
    }, [assetsLoaded, scene, bulletCache, assets, environmentCollision, allBullets, glowLayer]);

    useDeltaBeforeRender((scene, deltaS) => {
        const toRemove: string[] = [];
        if (isDead || scene.paused) return;

        Object.keys(allBullets).forEach((bulletGroupIndex) => {
            const bulletGroup = allBullets[bulletGroupIndex];

            //collision
            if (bulletGroup.behaviour instanceof PlayerBulletBehaviour) {
                bulletGroup.behaviour.getCollisions()?.then((buffer) => {
                    const collisions = convertPlayerBulletCollisions(buffer);
                    collisions.forEach((collision) => {
                        if (collision.collisionID >= MAX_ENEMIES && collision.collisionID < MAX_ENEMIES * 2) {
                            const enemyID = collision.collisionID - MAX_ENEMIES;
                            globalActorRefs.enemies[enemyID].health -= bulletGroup.behaviour.bulletValue;
                            playHitSound.current = true;
                            if (globalActorRefs.enemies[enemyID]) {
                                LS.SCORE += 10;
                                addEffect(collision.hit, {
                                    type: 'particles',
                                    name: 'hit',
                                });
                            }
                        }
                    });
                });
            } else {
                bulletGroup.behaviour.getCollisions()?.then((buffer) => {
                    const collisions = convertEnemyBulletCollisions(buffer);
                    if (collisions.length > 0) {
                        const collision = collisions[0];
                        if (collision.point) {
                            LS.POINT += collision.point / 2;
                            LS.SCORE += 50000 * (collision.point / 2);
                            itemGet.play();
                        }
                        if (collision.power) {
                            if (LS.POWER === 120) {
                                LS.SCORE += 50000 * (collision.power / 2);
                            } else {
                                LS.POWER = Math.min(LS.POWER + collision.power / 2, 120);
                            }
                            itemGet.play();
                        }
                        if (collision.player) {
                            if (!playerInvulnerable.current) {
                                LS.PLAYER -= 1;
                                LS.BOMB = LS.INITIAL_BOMB;
                                playerInvulnerable.current = true;
                                window.setTimeout(() => {
                                    playerInvulnerable.current = false;
                                }, PLAYER_INVULNERABLE_COOLDOWN * 1000);
                                playerDeath.play();

                                if (LS.PLAYER === 0) {
                                    window.setTimeout(() => setIsDead(true), 300);
                                }
                            }
                        }
                        if (collision.graze) {
                            LS.GRAZE += collision.graze / 2;
                            LS.SCORE += 2000 * (collision.graze / 2);
                            playerGraze.play();
                        }
                    }
                });
            }

            //lifespan
            bulletGroup.timeSinceStart += deltaS;
            if (bulletGroup.timeSinceStart > bulletGroup.lifespan) {
                toRemove.push(bulletGroupIndex);
            } else {
                bulletGroup.behaviour.update(deltaS);
                if (bulletGroup.sounds) bulletGroup.sounds.update(deltaS);
            }
        });

        if (toRemove.length > 0) dispose(toRemove);

        globalActorRefs.enemies.forEach((enemy, i) => {
            const offset = i * 3;
            globalActorRefs.enemyPositionBuffer[offset + 0] = enemy.position.x;
            globalActorRefs.enemyPositionBuffer[offset + 1] = enemy.position.y;
            globalActorRefs.enemyPositionBuffer[offset + 2] = enemy.position.z;
            globalActorRefs.enemyRadiiBuffer[i] = enemy.radius;
        });

        globalActorRefs.bombs.forEach((bomb, i) => {
            const offset = i * 3;
            globalActorRefs.bombPositionBuffer[offset + 0] = bomb.position.x;
            globalActorRefs.bombPositionBuffer[offset + 1] = bomb.position.y;
            globalActorRefs.bombPositionBuffer[offset + 2] = bomb.position.z;
            globalActorRefs.bombRadiiBuffer[i] = bomb.radius;
        });
    });

    return { addBulletGroup, isDead };
};
