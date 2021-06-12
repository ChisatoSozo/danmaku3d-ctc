import { Effect } from '@babylonjs/core';
import { MakeBehaviour } from '.';
import { glsl } from '../../utils/BabylonUtils';
import { collisionSnippet, mainHeaderSnippet, uniformSnippet } from './CommonBehaviourShaders';
import { EnemyBulletBehaviour } from './EnemyBulletBehaviour';

Effect.ShadersStore['linearBehaviourPositionPixelShader'] = glsl`
    ${uniformSnippet}

    void main()	{
        ${mainHeaderSnippet}

        vec3 out_Position = position + (velocity * delta);

        ${collisionSnippet}
        
        gl_FragColor = vec4(out_Position, 1.0);
    }
`;

Effect.ShadersStore['linearBehaviourVelocityPixelShader'] = glsl`
    ${uniformSnippet}

    void main() {

        ${mainHeaderSnippet}

        vec3 out_Velocity = velocity;

        gl_FragColor = vec4(out_Velocity, velocityW);
    }
`;

export const makeLinearBehaviour: MakeBehaviour = (behaviourOptions, environmentCollision, radius, parent) => {
    if (behaviourOptions.bulletType === undefined) throw new Error('bulletType must be set when making an enemy bullet behaviour');

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
