import { AbstractAssetTask, AssetsManager, ParticleHelper, ParticleSystemSet, Scene } from '@babylonjs/core';

export class CustomAssetsManager extends AssetsManager {
    public addParticlesTask(particleName: string, rootUrl: string): ParticlesAssetTask {
        const task = new ParticlesAssetTask(particleName, rootUrl);
        this._tasks.push(task);

        return task;
    }
}

export class ParticlesAssetTask extends AbstractAssetTask {
    /**
     * Get the loaded particle system
     */
    //@ts-ignore
    public loadedParticleSystem: IParticleSystem;

    /**
     * Callback called when the task is successful
     */
    //@ts-ignore
    public onSuccess: (task: ParticlesAssetTask) => void;

    /**
     * Callback called when the task is successful
     */
    //@ts-ignore
    public onError: (task: ParticlesAssetTask, message?: string, exception?: any) => void;

    /**
     * Creates a new ParticlesAssetTask
     * @param name defines the name of the task
     * @param meshesNames defines the list of mesh's names you want to load
     * @param rootUrl defines the root url to use as a base to load your meshes and associated resources
     * @param sceneFilename defines the filename or File of the scene to load from
     */
    constructor(
        /**
         * Defines the particle system json you want to load
         */
        public particleName: string,
        /**
         * Defines the root url to use as a base to load your meshes and associated resources
         */
        public rootUrl: string,
    ) {
        super(particleName);
    }

    /**
     * Execute the current task
     * @param scene defines the scene where you want your assets to be loaded
     * @param onSuccess is a callback called when the task is successfully executed
     * @param onError is a callback called if an error occurs
     */
    public runTask(scene: Scene, onSuccess: () => void, onError: (message?: string, exception?: any) => void) {
        ParticleHelper.BaseAssetsUrl = this.rootUrl;
        ParticleSystemSet.BaseAssetsUrl = this.rootUrl;
        ParticleHelper.CreateAsync(this.name, scene, false)
            .then((set) => {
                this.loadedParticleSystem = set.systems[0];
                onSuccess();
            })
            .catch((reason) => {
                onError('Particle system failed to load', reason);
            });
    }
}
