import { Group, Texture, TextureLoader } from 'three';
import { GLTF, GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import { Font, FontLoader } from 'three/examples/jsm/loaders/FontLoader.js';

type AssetsType = {
    [key: string]: AssetsItem;
};

type AssetsItem = {
    gltf?: GLTF;
    texture?: Texture;
    img?: HTMLImageElement;
    font?: Font;
    obj?: Group;
};

type DataItem = {
    name?: string;
    gltf?: string;
    texture?: string;
    img?: string;
    font?: string;
    obj?: string;
};

export class LoaderManager {
    private textureLoader: TextureLoader;
    private GLTFLoader: GLTFLoader;
    private OBJLoader: OBJLoader;
    private DRACOLoader: DRACOLoader;
    private FontLoader: FontLoader;
    _assets: AssetsType

    constructor() {
        this._assets = {};
        this.textureLoader = new TextureLoader();
        this.GLTFLoader = new GLTFLoader();
        this.OBJLoader = new OBJLoader();
        this.DRACOLoader = new DRACOLoader();
        this.FontLoader = new FontLoader();
    }

    get assets(): AssetsType {
        return this._assets;
    }

    set assets(value: AssetsType) {
        this._assets = value;
    }

    get(name: string) {
        return this._assets[name];
    }

    load(data: DataItem[]) {
        return new Promise<void>((resolve) => {
            const promises = [];

            for (let i = 0; i < Object.values(data).length; i++) {
                const { name, gltf, texture, img, font, obj } = data[i];

                if (!name) return;

                if (!this._assets[name]) {
                    this._assets[name] = {};
                }

                if (gltf) {
                    promises.push(this.loadGLTF(gltf, name));
                }

                if (texture) {
                    promises.push(this.loadTexture(texture, name));
                }

                if (img) {
                    promises.push(this.loadImage(img, name));
                }

                if (font) {
                    promises.push(this.loadFont(font, name));
                }

                if (obj) {
                    promises.push(this.loadObj(obj, name));
                }
            }

            void Promise.all(promises).then(() => resolve())
        });
    }

    private loadGLTF(url: string, name: string): Promise<GLTF> {
        return new Promise<GLTF>((resolve) => {
            this.DRACOLoader.setDecoderPath('https://www.gstatic.com/draco/v1/decoders/');
            this.GLTFLoader.setDRACOLoader(this.DRACOLoader);

            this.GLTFLoader.load(
                url,
                (result) => {
                    this._assets[name].gltf = result;
                    resolve(result);
                },
                undefined,
                (e) => {
                    // eslint-disable-next-line no-console
                    console.log(e);
                }
            );
        });
    }

    private loadTexture(url: string, name: string): Promise<Texture> {
        return new Promise<Texture>((resolve) => {
            this.textureLoader.load(url, (result) => {
                this._assets[name].texture = result;
                resolve(result);
            });
        });
    }

    private loadImage(url: string, name: string): Promise<HTMLImageElement> {
        return new Promise<HTMLImageElement>((resolve) => {
            const image = new Image();

            image.onload = () => {
                this._assets[name].img = image;
                resolve(image);
            };

            image.src = url;
        });
    }

    private loadFont(url: string, name: string): Promise<Font> {
        // you can convert font to typeface.json using https://gero3.github.io/facetype.js/
        return new Promise<Font>((resolve) => {
            this.FontLoader.load(
                url,
                // onLoad callback
                (font) => {
                    this._assets[name].font = font;
                    resolve(font);
                },

                // onProgress callback
                () =>
                    // xhr
                    {
                        // console.log((xhr.loaded / xhr.total) * 100 + '% loaded')
                    },

                // onError callback
                (err) => {
                    // eslint-disable-next-line no-console
                    console.log('An error happened', err);
                }
            );
        });
    }

    // https://threejs.org/docs/#examples/en/loaders/OBJLoader
    private loadObj(url: string, name: string) {
        return new Promise((resolve) => {
            // load a resource
            this.OBJLoader.load(
                // resource URL
                url,
                // called when resource is loaded
                (object) => {
                    this._assets[name].obj = object;
                    resolve(object);
                },
                // onProgress callback
                () =>
                    // xhr
                    {
                        // console.log((xhr.loaded / xhr.total) * 100 + '% loaded')
                    },
                // called when loading has errors
                (err) => {
                    // eslint-disable-next-line no-console
                    console.log('An error happened', err);
                }
            );
        });
    }
}
