import { Color3, Effect, ShaderMaterial } from '@babylonjs/core';
import { v4 as uuid } from 'uuid';
import { MakeMaterial } from '.';
import { glsl } from '../../utils/BabylonUtils';
import { commonVertexShaderWithWarning } from './CommonMaterialShaders';

Effect.ShadersStore.fresnelVertexShader = commonVertexShaderWithWarning;
Effect.ShadersStore.fresnelFragmentShader = glsl`
    uniform vec3 toColor;
    varying vec3 vPositionW;
    varying vec3 vNormalW;
    uniform vec3 cameraPosition;
    uniform vec3 playerPosition;
    uniform float alpha;

    void main() {

        vec3 color = vec3(1., 1., 1.);

        vec3 viewDirectionW = normalize(cameraPosition - vPositionW);
        float fresnelTerm = dot(viewDirectionW, vNormalW);
        fresnelTerm = clamp(1. - fresnelTerm, 0., 1.0);

        color = mix(color, toColor, fresnelTerm);
        // vec3 antiColor = vec3(1.0, 1.0, 1.0) - color;

        // float dist = clamp(distance(vPositionW, playerPosition) * .5, 0., 1.);
        // color = mix(antiColor, color, dist);

        gl_FragColor = vec4(color, alpha);
    }
`;

export const makeFresnelMaterial: MakeMaterial = (materialOptions, assets, scene) => {
    const material = new ShaderMaterial(
        uuid() + 'fresnel',
        scene,
        {
            vertex: 'fresnel',
            fragment: 'fresnel',
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
