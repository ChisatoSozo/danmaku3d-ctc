import { Constants, Effect, Scene, Texture, Vector2 } from '@babylonjs/core';
import { times } from 'lodash';
import { v4 } from 'uuid';
import { CustomFloatProceduralTexture } from '../../forks/CustomFloatProceduralTexture';
import { makeName } from '../../hooks/useName';
import { glsl } from '../../utils/BabylonUtils';
import { nextPowerOfTwo } from '../../utils/Utils';

Effect.ShadersStore.addReducerPixelShader = glsl`
    uniform sampler2D source;
    uniform vec2 sourceResolution;

    void main() {
        vec2 offset = ((gl_FragCoord.xy - vec2(0.5, 0.5)) * 2.) + vec2(0.5, 0.5);

        vec4 outValue = vec4(0., 0., 0., 0.);

        for(float i = 0.; i < 2.; i++){
            for(float j = 0.; j < 2.; j++){
                vec2 curPixel = offset + vec2(i, j);
                vec2 uv = curPixel / sourceResolution;
                outValue += texture2D( source, uv );
            }
        }
        
        gl_FragColor = outValue;
    }
`;

const makeProceduralTexture = (name: string, shader: string, WIDTH: number, scene: Scene) => {
    const proceduralTexture = new CustomFloatProceduralTexture(
        name + v4(),
        shader,
        WIDTH,
        scene,
        undefined,
        false,
        false,
        Constants.TEXTURETYPE_FLOAT,
    );

    return proceduralTexture;
};

const parallelReducer: (
    source: Texture | CustomFloatProceduralTexture,
    sourceResolution: number,
    scene: Scene,
) => [CustomFloatProceduralTexture, CustomFloatProceduralTexture[]] = (
    source: Texture | CustomFloatProceduralTexture,
    sourceResolution: number,
    scene: Scene,
) => {
    const reducerName = makeName('reducer');
    let reducer = new CustomFloatProceduralTexture(
        reducerName,
        'addReducer',
        sourceResolution / 2,
        scene,
        undefined,
        false,
        false,
        Constants.TEXTURETYPE_FLOAT,
    );
    reducer.setTexture('source', source);
    reducer.setVector2('sourceResolution', new Vector2(sourceResolution, sourceResolution));

    const reducerLayers = [reducer];

    for (let newResolution = sourceResolution / 2; newResolution > 1; newResolution /= 2) {
        const newReducerName = makeName('reducer');
        const newReducer = new CustomFloatProceduralTexture(
            newReducerName,
            'addReducer',
            newResolution / 2,
            scene,
            undefined,
            false,
            false,
            Constants.TEXTURETYPE_FLOAT,
        );
        newReducer.setTexture('source', reducer);
        newReducer.setVector2('sourceResolution', new Vector2(newResolution, newResolution));
        reducer = newReducer;

        if (newResolution > 2) {
            reducerLayers.push(newReducer);
        }
    }

    return [reducer, reducerLayers];
};

interface DifferentialPositionVelocityCollisionSystemArgs {
    num: number;
    startPositionsState: Texture;
    startVelocitiesState: Texture;
    startCollisionsState: Texture;
    positionShader: string;
    velocityShader: string;
    collisionShader: string;
    downsampleCollisions: boolean;
    scene: Scene;
    initialValuesFunction: (texture: CustomFloatProceduralTexture) => void;
    initialPositionValuesFunction?: (texture: CustomFloatProceduralTexture) => void;
    initialVelocityValuesFunction?: (texture: CustomFloatProceduralTexture) => void;
    initialCollisionValuesFunction?: (texture: CustomFloatProceduralTexture) => void;
}

export default class DifferentialPositionVelocityCollisionSystem {
    private positionTextures: CustomFloatProceduralTexture[];
    private velocityTextures: CustomFloatProceduralTexture[];
    private collisionTextures: CustomFloatProceduralTexture[];
    private allTextures: CustomFloatProceduralTexture[];
    public collisionResult: CustomFloatProceduralTexture;
    private reducerLayers: CustomFloatProceduralTexture[];

    private frame: number;
    private ready: boolean;
    private justStarted: boolean;

    constructor({
        num,
        startPositionsState,
        startVelocitiesState,
        startCollisionsState,
        positionShader,
        velocityShader,
        collisionShader,
        downsampleCollisions,
        scene,
        initialValuesFunction,
        initialPositionValuesFunction,
        initialVelocityValuesFunction,
        initialCollisionValuesFunction,
    }: DifferentialPositionVelocityCollisionSystemArgs) {
        const WIDTH = Math.max(nextPowerOfTwo(Math.ceil(Math.sqrt(num))), 2);
        this.positionTextures = times(2, () => makeProceduralTexture('position', positionShader, WIDTH, scene));
        this.velocityTextures = times(2, () => makeProceduralTexture('velocity', velocityShader, WIDTH, scene));
        this.collisionTextures = times(2, () => makeProceduralTexture('collision', collisionShader, WIDTH, scene));

        this.allTextures = [...this.positionTextures, ...this.velocityTextures, ...this.collisionTextures];

        this.allTextures.forEach((texture) => {
            texture.setTexture('positionSampler', startPositionsState);
            texture.setTexture('velocitySampler', startVelocitiesState);
            texture.setTexture('collisionSampler', startCollisionsState);
            texture.setVector2('resolution', new Vector2(WIDTH, WIDTH));
            texture.setFloat('delta', 0.001);
        });

        this.allTextures.forEach(initialValuesFunction);

        if (initialPositionValuesFunction) {
            this.positionTextures.forEach(initialPositionValuesFunction);
        }
        if (initialVelocityValuesFunction) {
            this.velocityTextures.forEach(initialVelocityValuesFunction);
        }
        if (initialCollisionValuesFunction) {
            this.collisionTextures.forEach(initialCollisionValuesFunction);
        }

        if (downsampleCollisions) {
            const [collisionResult, reducerLayers] = parallelReducer(this.collisionTextures[0], WIDTH, scene);
            this.collisionResult = collisionResult;
            this.reducerLayers = reducerLayers;
        } else {
            this.collisionResult = this.collisionTextures[0];
            this.reducerLayers = [];
        }

        this.frame = 0;
        this.ready = true;
        this.justStarted = true;
    }

    dispose() {
        this.allTextures.forEach((texture) => {
            texture.dispose();
        });

        this.collisionResult.dispose();

        if (this.reducerLayers) {
            this.reducerLayers.forEach((reducer) => {
                reducer.dispose();
            });
        }

        this.ready = false;
    }

    update(deltaS: number, bindOtherUniforms: (texture: CustomFloatProceduralTexture) => void) {
        if (!this.ready) {
            return;
        }

        if (
            this.allTextures.some((texture) => {
                return !texture.isReady();
            })
        ) {
            return;
        }

        if (this.justStarted) {
            this.justStarted = false;
            this.allTextures.forEach((texture) => {
                texture.isReady = () => true;
            });
        }

        const source = this.frame % 2;
        const dest = (this.frame + 1) % 2;

        this.positionTextures[source].sleep = false;
        this.velocityTextures[source].sleep = false;
        this.collisionTextures[source].sleep = false;
        this.positionTextures[dest].sleep = true;
        this.velocityTextures[dest].sleep = true;
        this.collisionTextures[dest].sleep = true;

        const bindSouceTextures = (destTexture: CustomFloatProceduralTexture) => {
            destTexture.setTexture('positionSampler', this.positionTextures[source]);
            destTexture.setTexture('velocitySampler', this.velocityTextures[source]);
            destTexture.setTexture('collisionSampler', this.collisionTextures[source]);
            destTexture.setFloat('delta', deltaS);
            bindOtherUniforms(destTexture);
        };

        bindSouceTextures(this.positionTextures[dest]);
        bindSouceTextures(this.velocityTextures[dest]);
        bindSouceTextures(this.collisionTextures[dest]);

        if (this.reducerLayers) {
            this.reducerLayers[0].setTexture('source', this.collisionTextures[dest]);
        } else {
            this.collisionResult = this.collisionTextures[dest];
        }

        this.frame = (this.frame + 1) % 2;

        return [this.positionTextures[dest], this.velocityTextures[dest], this.collisionTextures[dest]];
    }
}
