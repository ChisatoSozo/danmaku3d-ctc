import { Color3, Effect, ShaderMaterial } from '@babylonjs/core';
import { v4 as uuid } from 'uuid';
import { MakeMaterial } from '.';
import { glsl } from '../../utils/BabylonUtils';
import { LASER_WARNING } from '../../utils/Constants';
import { commonLaserVertexShaderWithWarning } from './CommonMaterialShaders';

Effect.ShadersStore.laserVertexShader = commonLaserVertexShaderWithWarning;
Effect.ShadersStore.laserFragmentShader = glsl`
    uniform vec3 toColor;
    varying vec3 vPositionW;
    varying vec3 vNormalW;
    uniform vec3 cameraPosition;
    uniform vec3 playerPosition;
    uniform float alpha;
    varying float dTiming;

    float rand(float n){return fract(sin(n) * 43758.5453123);}

    void main() {

        vec3 color = vec3(1.0, 1.0, 1.0);

        vec3 vNormalW2 = vNormalW;

        vec3 viewDirectionW = normalize(cameraPosition - vPositionW);

        float laserRand = rand(dTiming * 1000000.) * 0.2;
        float laserTerm = dot(viewDirectionW, vNormalW2) + laserRand;
        laserTerm = clamp(1. - laserTerm, 0., 1.0);
        
        
        color = mix(color, toColor, laserTerm );
        color = mix(color, vec3(1.0, 1.0, 1.0), float(dTiming < ${LASER_WARNING}.));
        // vec3 antiColor = vec3(1.0, 1.0, 1.0) - color;

        // float dist = clamp(distance(vPositionW, playerPosition) * .5, 0., 1.);
        // color = mix(antiColor, color, dist);

        gl_FragColor = vec4(color, alpha);
    }
`;

export const makeLaserMaterial: MakeMaterial = (materialOptions, assets, scene) => {
    const material = new ShaderMaterial(
        uuid() + 'laser',
        scene,
        {
            vertex: 'laser',
            fragment: 'laser',
        },
        {
            attributes: ['position', 'normal', 'uv', 'world0', 'world1', 'world2', 'world3'],
            uniforms: ['worldView', 'worldViewProjection', 'view', 'projection', 'direction', 'cameraPosition'],
            needAlphaBlending: materialOptions.hasAlpha,
        },
    );

    const color = materialOptions.color || [1.0, 0.0, 0.0];
    material.setColor3('toColor', new Color3(...color));
    material.setFloat('alpha', materialOptions.alpha || (materialOptions.hasAlpha && 0.2) || 1);

    return material;
};
