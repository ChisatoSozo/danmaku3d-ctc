import { Color3, Color4, Logger, Nullable, ProceduralTexture, Scene, Texture, Vector2, Vector3, WebRequest } from '@babylonjs/core';
import { _readTexturePixels } from './CustomFloatProceduralTextureReader';

/**
 * Procedural texturing is a way to programmatically create a texture. There are 2 types of procedural textures: code-only, and code that references some classic 2D images, sometimes called 'refMaps' or 'sampler' images.
 * Custom Procedural textures are the easiest way to create your own procedural in your application.
 * @see https://doc.babylonjs.com/how_to/how_to_use_procedural_textures#creating-custom-procedural-textures
 */

export interface Sync {
    sync: WebGLSync;
    promiseResolve: (buffer: ArrayBufferView) => void;
    promiseReject: (reason: string) => void;
    buffer: ArrayBufferView;
    PPB: WebGLBuffer;
}
export const allSyncs: {
    syncs: Sync[];
} = {
    syncs: [],
};

export class CustomFloatProceduralTexture extends ProceduralTexture {
    private _animate = true;
    private _time = 0;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private _config: any;
    private _texturePath: string;
    public sleep: boolean;

    /**
     * Instantiates a new Custom Procedural Texture.
     * Procedural texturing is a way to programmatically create a texture. There are 2 types of procedural textures: code-only, and code that references some classic 2D images, sometimes called 'refMaps' or 'sampler' images.
     * Custom Procedural textures are the easiest way to create your own procedural in your application.
     * @see https://doc.babylonjs.com/how_to/how_to_use_procedural_textures#creating-custom-procedural-textures
     * @param name Define the name of the texture
     * @param texturePath Define the folder path containing all the custom texture related files (config, shaders...)
     * @param size Define the size of the texture to create
     * @param scene Define the scene the texture belongs to
     * @param fallbackTexture Define a fallback texture in case there were issues to create the custom texture
     * @param generateMipMaps Define if the texture should creates mip maps or not
     */
    constructor(
        name: string,
        texturePath: string,
        size: number,
        scene: Scene,
        fallbackTexture?: Texture,
        generateMipMaps?: boolean,
        isCube?: boolean,
        textureType?: number,
    ) {
        super(name, size, null, scene, fallbackTexture, generateMipMaps, isCube, textureType);
        this._texturePath = texturePath;
        this.sleep = false;

        //Try to load json
        this._loadJson(texturePath);
        this.refreshRate = 1;
    }

    private _loadJson(jsonUrl: string): void {
        const noConfigFile = () => {
            try {
                this.setFragment(this._texturePath);
            } catch (ex) {
                Logger.Error('No json or ShaderStore or DOM element found for CustomFloatProceduralTexture');
            }
        };

        const configFileUrl = jsonUrl + '/config.json';
        const xhr = new WebRequest();

        xhr.open('GET', configFileUrl);
        xhr.addEventListener(
            'load',
            () => {
                if (xhr.status === 200 || (xhr.responseText && xhr.responseText.length > 0)) {
                    try {
                        this._config = JSON.parse(xhr.response);

                        this.updateShaderUniforms();
                        this.updateTextures();
                        this.setFragment(this._texturePath + '/custom');

                        this._animate = this._config.animate;
                        this.refreshRate = this._config.refreshrate;
                    } catch (ex) {
                        noConfigFile();
                    }
                } else {
                    noConfigFile();
                }
            },
            false,
        );

        xhr.addEventListener(
            'error',
            () => {
                noConfigFile();
            },
            false,
        );

        try {
            xhr.send();
        } catch (ex) {
            Logger.Error('CustomFloatProceduralTexture: Error on XHR send request.');
        }
    }

    /**
     * Is the texture ready to be used ? (rendered at least once)
     * @returns true if ready, otherwise, false.
     */
    public isReady(): boolean {
        if (!super.isReady()) {
            return false;
        }

        for (const name in this._textures) {
            const texture = this._textures[name];

            if (!texture.isReady()) {
                return false;
            }
        }

        return true;
    }

    /**
     * Render the texture to its associated render target.
     * @param useCameraPostProcess Define if camera post process should be applied to the texture
     */
    public render(useCameraPostProcess?: boolean): void {
        const scene = this.getScene();
        if (this._animate && scene) {
            this._time += scene.getAnimationRatio() * 0.03;
            this.updateShaderUniforms();
        }

        super.render(useCameraPostProcess);
    }

    /**
     * Update the list of dependant textures samplers in the shader.
     */
    public updateTextures(): void {
        for (let i = 0; i < this._config.sampler2Ds.length; i++) {
            this.setTexture(
                this._config.sampler2Ds[i].sample2Dname,
                new Texture(this._texturePath + '/' + this._config.sampler2Ds[i].textureRelativeUrl, this.getScene()),
            );
        }
    }

    /**
     * Update the uniform values of the procedural texture in the shader.
     */
    public updateShaderUniforms(): void {
        if (this._config) {
            for (let j = 0; j < this._config.uniforms.length; j++) {
                const uniform = this._config.uniforms[j];

                switch (uniform.type) {
                    case 'float':
                        this.setFloat(uniform.name, uniform.value);
                        break;
                    case 'color3':
                        this.setColor3(uniform.name, new Color3(uniform.r, uniform.g, uniform.b));
                        break;
                    case 'color4':
                        this.setColor4(uniform.name, new Color4(uniform.r, uniform.g, uniform.b, uniform.a));
                        break;
                    case 'vector2':
                        this.setVector2(uniform.name, new Vector2(uniform.x, uniform.y));
                        break;
                    case 'vector3':
                        this.setVector3(uniform.name, new Vector3(uniform.x, uniform.y, uniform.z));
                        break;
                }
            }
        }

        this.setFloat('time', this._time);
    }

    public readPixels(): Nullable<ArrayBufferView> {
        throw new Error('Not implemented');
        return null;
    }

    //@ts-ignore
    public readPixelsAsync(
        faceIndex?: number | undefined,
        level?: number | undefined,
        buffer?: Nullable<ArrayBufferView> | undefined,
    ): Promise<ArrayBufferView> | undefined {
        if (faceIndex === void 0) {
            faceIndex = 0;
        }
        if (level === void 0) {
            level = 0;
        }
        if (buffer === void 0) {
            buffer = null;
        }
        if (!this._texture) {
            return undefined;
        }
        const size = this.getSize();
        let width = size.width;
        let height = size.height;
        const engine = this._getEngine();
        if (!engine) {
            return undefined;
        }
        if (level !== 0) {
            width = width / Math.pow(2, level);
            height = height / Math.pow(2, level);
            width = Math.round(width);
            height = Math.round(height);
        }
        try {
            if (this._texture.isCube) {
                //@ts-ignore
                return _readTexturePixels(engine, this._texture, width, height, faceIndex, level, buffer);
            }
            //@ts-ignore
            return _readTexturePixels(engine, this._texture, width, height, -1, level, buffer);
        } catch (e) {
            console.warn(e);
            return undefined;
        }
    }

    /**
     * Define if the texture animates or not.
     */
    public get animate(): boolean {
        return this._animate;
    }

    public set animate(value: boolean) {
        this._animate = value;
    }
}
