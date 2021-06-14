import { Effect } from '@babylonjs/core';
import { MakeBehaviour } from '.';
import { glsl } from '../../utils/BabylonUtils';
import { collisionSnippet, mainLaserHeaderSnippet, uniformSnippet } from './CommonBehaviourShaders';
import { EnemyLaserBehaviour } from './EnemyLaserBehaviour';

Effect.ShadersStore['linearLaserBehaviourPositionPixelShader'] = glsl`
    ${uniformSnippet}

    void main()	{
        ${mainLaserHeaderSnippet}

        vec3 out_Position = position + (velocity * delta);

        ${collisionSnippet}
        
        gl_FragColor = vec4(out_Position, 1.0);
    }
`;

Effect.ShadersStore['linearLaserBehaviourVelocityPixelShader'] = glsl`
    ${uniformSnippet}

    void main() {

        ${mainLaserHeaderSnippet}

        vec3 out_Velocity = velocity;

        gl_FragColor = vec4(out_Velocity, velocityW);
    }
`;

export const makeLinearLaserBehaviour: MakeBehaviour = (behaviourOptions, environmentCollision, radius, parent) => {
    if (behaviourOptions.bulletType === undefined) throw new Error('bulletType must be set when making an enemy bullet behaviour');

    return new EnemyLaserBehaviour({
        positionShader: 'linearLaserBehaviourPosition',
        velocityShader: 'linearLaserBehaviourVelocity',
        parent,
        radius,
        bulletType: behaviourOptions.bulletType,
        collideWithEnvironment: environmentCollision,
        bulletValue: behaviourOptions.bulletValue,
    });
};
