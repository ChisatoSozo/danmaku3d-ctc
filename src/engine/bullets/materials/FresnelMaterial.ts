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
    uniform float alpha;

    void main() {

        vec3 color = vec3(1., 1., 1.);

        vec3 viewDirectionW = normalize(cameraPosition - vPositionW);
        float fresnelTerm = dot(viewDirectionW, vNormalW);
        fresnelTerm = clamp(1. - fresnelTerm, 0., 1.0);

        gl_FragColor = vec4(mix(color, toColor, fresnelTerm), 1.0);
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
