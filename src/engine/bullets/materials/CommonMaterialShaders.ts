import '@babylonjs/core/Shaders/ShadersInclude/instancesDeclaration';
import { glsl } from '../../utils/BabylonUtils';
import { BULLET_WARNING, LASER_LENGTH, LASER_WARNING } from '../../utils/Constants';

export const commonVertexShaderWithWarning = glsl`
    #include<instancesDeclaration>
    attribute vec3 position;
    attribute vec3 normal;
    attribute vec2 uv;
    uniform mat4 worldViewProjection;
    varying vec3 vPositionW;
    varying vec3 vNormalW;
    varying vec2 vUV;

    uniform sampler2D positionSampler;
    uniform sampler2D velocitySampler;
    uniform sampler2D timingsSampler;
    uniform sampler2D endTimingsSampler;

    uniform float timeSinceStart;
    uniform float disableWarning;
    uniform float radius;

    varying float dTiming;

    #include<helperFunctions>

    void makeRotation(in vec3 direction, out mat3 rotation)
    {
        vec3 xaxis = cross(vec3(0., 1., 0.), direction);
        xaxis = normalize(xaxis);

        vec3 yaxis = cross(direction, xaxis);
        yaxis = normalize(yaxis);

        rotation = mat3(xaxis, yaxis, direction);
    }

    void main() {
        int instance = gl_InstanceID;
        int width = textureSize(positionSampler, 0).x;
        int x = instance % width;
        int y = instance / width;                            // integer division
        float u = (float(x) + 0.5) / float(width);           // map into 0-1 range
        float v = (float(y) + 0.5) / float(width);
        vec4 instPos = texture(positionSampler, vec2(u, v));
        vec4 instVel = texture(velocitySampler, vec2(u, v));
        vec4 timingPosition = texture2D( timingsSampler, vec2(u, v));
        vec4 endTimingPosition = texture2D( endTimingsSampler, vec2(u, v) );
        float timing = timingPosition.w;

        mat3 rotation;
        makeRotation(normalize(vec3(instVel)), rotation);
        vec4 rotatedVert = vec4(rotation * position, 1.0 );

        dTiming = timeSinceStart - timing;

        float size = (${BULLET_WARNING} - clamp(dTiming, 0.0, ${BULLET_WARNING})) / ${BULLET_WARNING};
        size *= (1. - disableWarning);
        float hasEnded = float(dTiming > endTimingPosition.w);

        rotatedVert *= size * 3. + 1.;
        rotatedVert *= (1. - hasEnded);
        rotatedVert *= radius;

        vec4 totalPosition = vec4(rotatedVert.xyz + instPos.xyz, 1.0);

        vPositionW = totalPosition.xyz;
        vNormalW = rotation * normal;
        
        gl_Position = worldViewProjection * totalPosition;
    }
`;

export const commonLaserVertexShaderWithWarning = glsl`
#include<instancesDeclaration>
attribute vec3 position;
attribute vec3 normal;
attribute vec2 uv;
uniform mat4 worldViewProjection;
varying vec3 vPositionW;
varying vec3 vNormalW;
varying vec2 vUV;

uniform sampler2D positionSampler;
uniform sampler2D velocitySampler;
uniform sampler2D timingsSampler;
uniform sampler2D endTimingsSampler;

uniform float timeSinceStart;
uniform float disableWarning;
uniform float radius;
uniform float laserLength;

varying float dTiming;

#include<helperFunctions>

void makeRotation(in vec3 direction, out mat3 rotation)
{
    vec3 xaxis = cross(vec3(0., 1., 0.), direction);
    xaxis = normalize(xaxis);

    vec3 yaxis = cross(direction, xaxis);
    yaxis = normalize(yaxis);

    rotation = mat3(xaxis, yaxis, direction);
}

float rand(float n){return fract(sin(n) * 43758.5453123);}

void main() {
    int instance = gl_InstanceID;
    int width = textureSize(positionSampler, 0).x;
    int x = instance % width;
    int y = instance / width;                            // integer division
    float u = (float(x) + 0.5) / float(width);           // map into 0-1 range
    float v = (float(y) + 0.5) / float(width);
    vec4 instPos = texture(positionSampler, vec2(u, v));
    vec4 instVel = texture(velocitySampler, vec2(u, v));
    vec4 timingPosition = texture2D( timingsSampler, vec2(u, v));
    vec4 endTimingPosition = texture2D( endTimingsSampler, vec2(u, v) );
    float timing = timingPosition.w;

    dTiming = timeSinceStart - timing;

    float laserRand = rand(dTiming * 1000000.) * 0.2;
    float size = mix(0.01 / radius, 0.8 + laserRand, float(dTiming > ${LASER_WARNING}.));
    size *= (1. - disableWarning);
    float hasEnded = float(dTiming > endTimingPosition.w);

    vec3 vert = position;
    vert *= vec3(size, size, 1.);
    vert *= (1. - hasEnded);
    vert *= vec3(radius, radius, laserLength / ${LASER_LENGTH}.);

    mat3 rotation;
    makeRotation(normalize(vec3(instVel)), rotation);
    vec4 rotatedVert = vec4(rotation * vert, 1.0 );

    vec4 totalPosition = vec4(rotatedVert.xyz + instPos.xyz, 1.0);

    vPositionW = totalPosition.xyz;
    vNormalW = rotation * normal;
    
    gl_Position = worldViewProjection * totalPosition;
}
`;
