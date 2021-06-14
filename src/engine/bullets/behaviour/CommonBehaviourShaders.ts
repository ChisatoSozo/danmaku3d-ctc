import { Effect } from '@babylonjs/core';
import { glsl } from '../../utils/BabylonUtils';
import {
    BULLET_WARNING,
    GRAZE_DISTANCE,
    LASER_WARNING,
    MAX_BOMBS,
    MAX_BULLETS_PER_GROUP,
    MAX_ENEMIES,
} from '../../utils/Constants';

export const uniformSnippet = glsl`
    uniform float delta;
    uniform float timeSinceStart;
    uniform float translationFromParent;
    uniform float rotationFromParent;
    uniform vec2 resolution;
    uniform vec3 parentPosition;
    uniform mat4 parentRotation;
    uniform sampler2D positionSampler;
    uniform sampler2D velocitySampler;
    uniform sampler2D collisionSampler;
    uniform sampler2D initialPositionSampler;
    uniform sampler2D initialVelocitySampler;
    uniform sampler2D timingsSampler;
    uniform sampler2D endTimingsSampler;
`;

export const mainLaserHeaderSnippet = glsl`
    vec2 uv = gl_FragCoord.xy / resolution.xy;
    float id = (gl_FragCoord.x - 0.5) + ((gl_FragCoord.y - 0.5) * resolution.x);

    vec4 timingPosition = texture2D( timingsSampler, uv );
    
    vec3 initialPosition = texture2D( initialPositionSampler, uv ).xyz;
    vec3 position = texture2D( positionSampler, uv ).xyz;

    vec4 initialVelocity = texture2D( initialVelocitySampler, uv );
    vec4 currentVelocity = texture2D( velocitySampler, uv );
    
    vec4 collision = texture2D( collisionSampler, uv );

    float timing = timingPosition.w;

    mat4 parentRotationMatrix = (mat4(1.0) * (1.0 - rotationFromParent)) + (parentRotation * rotationFromParent);
    initialPosition = initialPosition * mat3(parentRotationMatrix) + translationFromParent * parentPosition;
    initialVelocity = initialVelocity * parentRotationMatrix;

    float dTiming = timeSinceStart - timing;
    float shouldAssignInitialStates = float(dTiming > 0.) * (1. - currentVelocity.w);

    position = mix(position, initialPosition, shouldAssignInitialStates);
    currentVelocity = mix(currentVelocity, initialVelocity, shouldAssignInitialStates);

    vec3 velocity = currentVelocity.xyz;
    float velocityW = currentVelocity.w;

    vec3 startPosition = position;
    vec3 startVelocity = velocity;
`;

export const mainHeaderSnippet = glsl`
    vec2 uv = gl_FragCoord.xy / resolution.xy;
    float id = (gl_FragCoord.x - 0.5) + ((gl_FragCoord.y - 0.5) * resolution.x);

    vec4 timingPosition = texture2D( timingsSampler, uv );
    
    vec3 initialPosition = texture2D( initialPositionSampler, uv ).xyz;
    vec3 position = texture2D( positionSampler, uv ).xyz;

    vec4 initialVelocity = texture2D( initialVelocitySampler, uv );
    vec4 currentVelocity = texture2D( velocitySampler, uv );
    
    vec4 collision = texture2D( collisionSampler, uv );

    float timing = timingPosition.w;

    mat4 parentRotationMatrix = (mat4(1.0) * (1.0 - rotationFromParent)) + (parentRotation * rotationFromParent);
    initialPosition = initialPosition * mat3(parentRotationMatrix) + translationFromParent * parentPosition;
    initialVelocity = initialVelocity * parentRotationMatrix;

    float dTiming = timeSinceStart - timing;
    float shouldAssignInitialStates = float(dTiming > 0.) * (1. - currentVelocity.w);
    float shouldPositionReset = float(dTiming > 0. && dTiming < ${BULLET_WARNING}) * float(parentPosition != vec3(0.,0.,0.));

    position = mix(position, initialPosition, shouldPositionReset);
    currentVelocity = mix(currentVelocity, initialVelocity, shouldAssignInitialStates);

    vec3 velocity = currentVelocity.xyz;
    float velocityW = currentVelocity.w;

    vec3 startPosition = position;
    vec3 startVelocity = velocity;
`;

export const collisionSnippet = glsl`
    float collidedWithAnything = clamp(collision.w, 0.0, 1.0);
    float noCollision = 1. - collidedWithAnything;

    out_Position = (collidedWithAnything * vec3(-510., -510., -510.)) + (noCollision * out_Position);
`;

export const playerBulletCollisionPixelShader = glsl`
    uniform vec2 resolution;
    uniform sampler2D positionSampler;
    uniform float enemyPositions[${MAX_ENEMIES * 3}];
    uniform float enemyRadii[${MAX_ENEMIES}];
    uniform vec3 collideWithEnvironment;
    uniform vec3 arenaMin;
    uniform vec3 arenaMax;

    void main(){
        vec2 uv = gl_FragCoord.xy / resolution;
        vec3 position = texture2D( positionSampler, uv ).xyz;

        //Bullet colliding with floor?
        float collision = collideWithEnvironment.x * float(position.y < arenaMin.y);
        //Bullet colliding with walls?
        collision = max(collision, collideWithEnvironment.y * float(position.x < arenaMin.x || position.x > arenaMax.x));
        //Bullet colliding with ceiling?
        collision = max(collision, collideWithEnvironment.z * float(position.y > arenaMax.y));

        for(int i = 0; i < ${MAX_ENEMIES}; i ++){
            int offset = i * 3;
            vec3 enemyPosition = vec3(enemyPositions[offset], enemyPositions[offset + 1], enemyPositions[offset + 2]);
            float enemyBulletDistance = distance(position, enemyPosition);
            float close = float(enemyBulletDistance < enemyRadii[i]);
            collision = max(collision, close * (${MAX_ENEMIES}. + float(i)));
        }


        //Bullet exists in scene?
        collision = collision * float(position.y > -500.);

        gl_FragColor = vec4(position, collision);
    }
`;

/**
 * x: 0 is no collision, 1x is points, ${MAX_BULLETS_PER_GROUP}x is graze
 * y: 0 is no collision, 1x is bomb, 1000x is life
 * z: 0 is no collision, 1x is power, 1000x is special
 * w: 0 is no collision, 1x is environment, ${MAX_BULLETS_PER_GROUP}x is collidingWithPlayer
 *
 */

Effect.ShadersStore.enemyBulletCollisionPixelShader = glsl`
    uniform float bulletRadius;
    uniform float timeSinceStart;
    uniform vec2 resolution;
    uniform sampler2D positionSampler;
    uniform sampler2D timingsSampler;
    uniform sampler2D endTimingsSampler;
    uniform float bombPositions[${MAX_BOMBS * 3}];
    uniform float bombRadii[${MAX_BOMBS}];
    uniform vec3 bulletTypePack1;
    uniform vec3 bulletTypePack2;
    uniform vec3 collideWithEnvironment;
    uniform vec3 playerPosition;
    uniform vec3 arenaMin;
    uniform vec3 arenaMax;

    void main(){
        vec2 uv = gl_FragCoord.xy / resolution;
        vec3 position = texture2D( positionSampler, uv ).xyz;
        vec4 timingPosition = texture2D( timingsSampler, uv);
        vec4 endTimingPosition = texture2D( endTimingsSampler, uv );

        //Bullet colliding with floor?
        float collidingWithEnvironment = collideWithEnvironment.x * float(position.y < arenaMin.y);
        //Bullet colliding with walls?
        collidingWithEnvironment = max(collidingWithEnvironment, collideWithEnvironment.y * float(position.x < arenaMin.x || position.x > arenaMax.x));
        //Bullet colliding with ceiling?
        collidingWithEnvironment = max(collidingWithEnvironment, collideWithEnvironment.z * float(position.y > arenaMax.y));

        float isBullet = bulletTypePack1.x;
        float isLife = bulletTypePack1.y;
        float isBomb = bulletTypePack1.z;
        float isPower = bulletTypePack2.x;
        float isPoint = bulletTypePack2.y;
        float isSpecial = bulletTypePack2.z;

        for(int i = 0; i < ${MAX_BOMBS}; i ++){
            int offset = i * 3;
            vec3 bombPosition = vec3(bombPositions[offset], bombPositions[offset + 1], bombPositions[offset + 2]);
            float bombBulletDistance = distance(position, bombPosition);
            float close = isBullet * float(bombBulletDistance < bombRadii[i]);
            collidingWithEnvironment = max(collidingWithEnvironment, close);
        }

        float graze = (bulletRadius + ${GRAZE_DISTANCE}) - distance(playerPosition, position);
        float isGraze = float(graze > 0.);
        float collidingWithPlayer = float(distance(playerPosition, position) < (bulletRadius));

        float w = collidingWithPlayer + collidingWithEnvironment + isBullet * ${MAX_BULLETS_PER_GROUP}. * collidingWithPlayer;
        float x = isPoint * collidingWithPlayer + ${MAX_BULLETS_PER_GROUP}. * isBullet * isGraze;
        float y = isBomb * collidingWithPlayer + 1000. * isLife * collidingWithPlayer;
        float z = isPower * collidingWithPlayer + 1000. * isSpecial * collidingWithPlayer;

        vec4 collision = vec4(x, y, z, w);

        //Bullet exists in scene?
        collision = collision * float(position.y > -500.);

        //Bullet hasn't gone past it's end timing
        float timing = timingPosition.w;
        float dTiming = timeSinceStart - timing;
        float hasEnded = max(float(dTiming > endTimingPosition.w), float(dTiming < ${BULLET_WARNING}));
        collision = collision * (1. - hasEnded);

        gl_FragColor = collision;
    }
`;

Effect.ShadersStore.enemyLaserCollisionPixelShader = glsl`
    uniform float bulletRadius;
    uniform float timeSinceStart;
    uniform vec2 resolution;
    uniform sampler2D positionSampler;
    uniform sampler2D velocitySampler;
    uniform sampler2D timingsSampler;
    uniform sampler2D endTimingsSampler;
    uniform float bombPositions[${MAX_BOMBS * 3}];
    uniform float bombRadii[${MAX_BOMBS}];
    uniform vec3 bulletTypePack1;
    uniform vec3 bulletTypePack2;
    uniform vec3 collideWithEnvironment;
    uniform vec3 playerPosition;
    uniform vec3 arenaMin;
    uniform vec3 arenaMax;
    uniform float laserLength;

    float distSquared( vec3 A, vec3 B )
    {
        vec3 C = A - B;
        return dot( C, C );
    }
    float minimumDistance(vec3 v, vec3 w, vec3 p) {
        // Return minimum distance between line segment vw and point p
        float l2 = max(distSquared(v, w), 0.01);  // i.e. |w-v|^2 -  avoid a sqrt
        // Consider the line extending the segment, parameterized as v + t (w - v).
        // We find projection of point p onto the line. 
        // It falls where t = [(p-v) . (w-v)] / |w-v|^2
        // We clamp t from [0,1] to handle points outside the segment vw.
        float t = clamp(dot(p - v, w - v) / l2, 0., 1.);
        vec3 projection = v + t * (w - v);  // Projection falls on the segment
        return distance(p, projection);
    }
    float laserDistance( vec3 position, vec3 velocity, float laserLength, vec3 testPoint) {
        float len = max(length(velocity), 0.001);
        vec3 normal = velocity / len;

        vec3 position2 = position + normal * laserLength;

        return minimumDistance(position, position2, testPoint);
    }

    void main(){
        vec2 uv = gl_FragCoord.xy / resolution;
        vec3 position = texture2D( positionSampler, uv ).xyz;
        vec3 velocity = texture2D( velocitySampler, uv ).xyz;
        vec4 timingPosition = texture2D( timingsSampler, uv);
        vec4 endTimingPosition = texture2D( endTimingsSampler, uv );
        //Bullet colliding with floor?
        float collidingWithEnvironment = 0.;
        for(int i = 0; i < ${MAX_BOMBS}; i ++){
            int offset = i * 3;
            vec3 bombPosition = vec3(bombPositions[offset], bombPositions[offset + 1], bombPositions[offset + 2]);
            float bombBulletDistance = laserDistance(position, velocity, laserLength, bombPosition);
            float close = float(bombBulletDistance < bombRadii[i]);
            collidingWithEnvironment = max(collidingWithEnvironment, close);
        }
        float playerDistance = laserDistance(position, velocity, laserLength, playerPosition);
        float graze = (bulletRadius + ${GRAZE_DISTANCE}) - playerDistance;
        float isGraze = float(graze > 0.);
        float collidingWithPlayer = float(playerDistance < bulletRadius);
        float w = collidingWithPlayer + collidingWithEnvironment + ${MAX_BULLETS_PER_GROUP}. * collidingWithPlayer;
        float x = 0.;
        float y = 0.;
        float z = 0.;
        vec4 collision = vec4(x, y, z, w);
        //Bullet exists in scene?
        collision = collision * float(position.y > -500.);
        //Bullet hasn't gone past it's end timing
        float timing = timingPosition.w;
        float dTiming = timeSinceStart - timing;
        float hasEnded = max(float(dTiming > endTimingPosition.w), float(dTiming < ${LASER_WARNING}.));
        collision = collision * (1. - hasEnded);
        gl_FragColor = collision;
    }
`;
