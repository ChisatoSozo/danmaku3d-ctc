import { useBeforeRender } from 'react-babylonjs';
import { allSyncs, Sync } from '../forks/CustomFloatProceduralTexture';

export const useResolveFloatTextureReadPixels = () => {
    useBeforeRender((scene) => {
        const gl = scene.getEngine()._gl as unknown as WebGL2RenderingContext;

        const newSyncs: Sync[] = [];

        allSyncs.syncs.forEach((sync) => {
            const res = gl.clientWaitSync(sync.sync, 0, 0);
            if (res === gl.WAIT_FAILED) {
                sync.promiseReject('Wait failed!');
                return;
            }
            if (res === gl.TIMEOUT_EXPIRED) {
                newSyncs.push(sync);
                return;
            }

            gl.deleteSync(sync.sync);
            gl.bindBuffer(gl.PIXEL_PACK_BUFFER, sync.PPB);
            gl.getBufferSubData(gl.PIXEL_PACK_BUFFER, 0, sync.buffer);
            gl.bindBuffer(gl.PIXEL_PACK_BUFFER, null);

            sync.promiseResolve(sync.buffer);
        });

        allSyncs.syncs = newSyncs;
    });
};
