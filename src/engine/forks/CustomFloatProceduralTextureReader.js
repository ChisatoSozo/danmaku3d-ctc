import { allSyncs } from './CustomFloatProceduralTexture';

const readLatency = 16;

export const _readTexturePixels = function (engine, texture, width, height, faceIndex, level, buffer) {
    if (faceIndex === void 0) {
        faceIndex = -1;
    }
    if (level === void 0) {
        level = 0;
    }
    if (buffer === void 0) {
        buffer = null;
    }

    const numPPB = readLatency;

    var gl = engine._gl;
    if (!gl) {
        throw new Error('Engine does not have gl rendering context.');
    }
    if (!engine._dummyFramebuffer) {
        var dummy = gl.createFramebuffer();
        if (!dummy) {
            throw new Error('Unable to create dummy framebuffer');
        }
        engine._dummyFramebuffer = dummy;
    }
    if (!texture._PPBWheel) {
        texture._PPBWheel = [];
        for (let i = 0; i < numPPB; i++) {
            const newPPB = gl.createBuffer();
            if (!newPPB) {
                throw new Error('Unable to create PPB');
            }
            texture._PPBWheel.push(newPPB);
        }

        texture._activePPB = texture._PPBWheel[0];
        texture._activePPBIndex = 0;
    }

    //swap PIXEL_PACK_BUFFER
    texture._activePPBIndex = (texture._activePPBIndex + 1) % texture._PPBWheel.length;
    texture._activePPB = texture._PPBWheel[texture._activePPBIndex];

    gl.bindFramebuffer(gl.FRAMEBUFFER, engine._dummyFramebuffer);
    if (faceIndex > -1) {
        gl.framebufferTexture2D(
            gl.FRAMEBUFFER,
            gl.COLOR_ATTACHMENT0,
            gl.TEXTURE_CUBE_MAP_POSITIVE_X + faceIndex,
            texture._webGLTexture,
            level,
        );
    } else {
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture._webGLTexture, level);
    }
    var readType = texture.type !== undefined ? engine._getWebGLTextureType(texture.type) : gl.UNSIGNED_BYTE;
    switch (readType) {
        case gl.UNSIGNED_BYTE:
            if (!buffer) {
                buffer = new Uint8Array(4 * width * height);
            }
            readType = gl.UNSIGNED_BYTE;
            break;
        default:
            if (!buffer) {
                buffer = new Float32Array(4 * width * height);
            }
            readType = gl.FLOAT;
            break;
    }

    gl.bindBuffer(gl.PIXEL_PACK_BUFFER, texture._activePPB);
    gl.bufferData(gl.PIXEL_PACK_BUFFER, buffer.byteLength, gl.STREAM_READ);
    gl.readPixels(0, 0, width, height, gl.RGBA, readType, 0);
    gl.bindFramebuffer(gl.FRAMEBUFFER, engine._currentFramebuffer);

    const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
    if (!sync) {
        return null;
    }
    gl.flush();

    let promiseResolve;
    let promiseReject;

    const returnPromise = new Promise(function (resolve, reject) {
        promiseResolve = resolve;
        promiseReject = reject;
    });

    allSyncs.syncs.push({
        sync,
        promiseResolve,
        promiseReject,
        buffer,
        PPB: texture._activePPB,
    });

    return returnPromise;
};
