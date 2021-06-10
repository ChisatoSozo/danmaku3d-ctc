import { Effect } from '@babylonjs/core';
import { MakeBehaviour } from '.';
import { glsl } from '../../utils/BabylonUtils';
import { collisionSnippet, mainHeaderSnippet, postVelocityComputeSnippet, uniformSnippet } from './CommonBehaviourShaders';
import { EnemyBulletBehaviour } from './EnemyBulletBehaviour';

Effect.ShadersStore['linearBehaviourPositionPixelShader'] = glsl`
    ${uniformSnippet}

    void main()	{
        ${mainHeaderSnippet}

        vec4 out_Position = vec4( position + (velocity * delta), 1.);

        ${collisionSnippet}
        
        gl_FragColor = out_Position;
    }
`;

Effect.ShadersStore['linearBehaviourVelocityPixelShader'] = glsl`
    ${uniformSnippet}

    void main() {

        ${mainHeaderSnippet}

        ${postVelocityComputeSnippet}
        vec4 out_Velocity = vec4( velocity, 1.);

        gl_FragColor = out_Velocity;
    }
`;

export const makeLinearBehaviour: MakeBehaviour = (behaviourOptions, environmentCollision, assets, scene, radius, parent) => {
    if (!behaviourOptions.bulletType) throw new Error('bulleType must be set when making an enemy bullet behaviour');

    return new EnemyBulletBehaviour({
        positionShader: 'linearBehaviourPosition',
        velocityShader: 'linearBehaviourVelocity',
        parent,
        radius,
        bulletType: behaviourOptions.bulletType,
        collideWithEnvironment: environmentCollision,
        bulletValue: behaviourOptions.bulletValue,
    });
};
