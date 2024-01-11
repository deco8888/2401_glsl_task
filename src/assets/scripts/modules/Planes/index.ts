import { IUniform, Mesh, PlaneGeometry, ShaderMaterial, Texture, TextureLoader, Uniform, Vector2 } from 'three';
import { Distortion } from '../Distortion';

import vertexShader from '../../glsl/planes/vertex.glsl';
import fragmentShader from '../../glsl/planes/fragment.glsl';
import { LoaderCheck } from '../LoaderCheck';
import { lerp } from '../../utils/math';

type PlaneMetricsParams = {
    planeWidth: number;
    planeHeight: number;
    x: number;
    space: number;
};

export class Planes {
    private distortion: Distortion;
    private images: string[];
    private meshes: Mesh[] = [];
    public textures: Texture[] = [];
    private hovering: number;
    private initiated: boolean;
    private uniforms: { [uniform: string]: IUniform };
    private geometry: PlaneGeometry | null = null;

    constructor(distortion: Distortion, images: string[]) {
        this.distortion = distortion;
        this.images = images;
        this.hovering = -1;
        this.initiated = false;
        this.uniforms = {
            uPlaneSize: new Uniform(new Vector2(0, 0)),
        };
    }

    public async load(loaderCheck: LoaderCheck): Promise<void> {
        await Promise.all(
            this.images.map(async (_, i) => {
                loaderCheck.begin(`image-${i}`);
                await this.setTexture(i);
                loaderCheck.end(`image-${i}`);
            })
        );
    }

    private setTexture(i: number): Promise<null> {
        return new Promise((resolve) => {
            const textureLoader = new TextureLoader();
            textureLoader.load(this.images[i], (image) => {
                this.textures[i] = image;
                resolve(null);
            });
        });
    }

    public init(): void {
        this.initiated = true;

        const { x, space } = this.getValue(window.innerWidth, window.innerHeight);
        this.initMesh(x, space);
    }

    private initMesh(x: number, space: number): void {
        for (let i = 0; i < 3; i++) {
            const texture = this.textures[i];

            /* eslint-disable @typescript-eslint/no-unsafe-member-access */
            const texW = texture ? (texture.image.width as number) : 0;
            const texH = texture ? (texture.image.height as number) : 0;
            /* eslint-enable */

            const uniforms = {
                uZoom: new Uniform(0.0),
                uZoomDelta: new Uniform(0.2),
                uPlaneSize: this.uniforms.uPlaneSize,
                uImage: new Uniform(texture),
                uImageSize: new Uniform(new Vector2(texW, texH)),
                uMouse: new Uniform(new Vector2(0, 0)),
            };

            const material = new ShaderMaterial({
                uniforms,
                vertexShader,
                fragmentShader,
            });

            if (!this.geometry) return;
            const mesh = new Mesh(this.geometry, material);
            mesh.position.x = x + i * space;
            // userData: 独自の変数を格納
            mesh.userData.index = i;
            this.meshes.push(mesh);
            this.distortion.scene?.add(mesh);
        }
    }

    private getPlaneMetrics(viewWidth: number, viewHeight: number, width: number, _height: number): PlaneMetricsParams {
        const planeWidth = viewWidth / 4.5;
        if (width < 800) {
            return {
                planeWidth: viewWidth / 3,
                planeHeight: viewHeight * 0.8,
                x: 0,
                // 静止スペースを計算、プレーン数で割る
                space: viewWidth / 2,
            };
        } else {
            return {
                planeWidth,
                planeHeight: viewHeight * 0.8,
                x: viewWidth / 5 / 1.5,
                space: (viewWidth - (viewWidth / 5 / 1.5) * 2 - planeWidth) / 2,
            };
        }
    }

    private getValue(winW: number, winH: number): { x: number; space: number } {
        const { width, height } = this.distortion.getViewSize();

        const planeMetrics = this.getPlaneMetrics(
            width, //
            height, //
            winW, //
            winH //
        );

        const pw = planeMetrics.planeWidth;
        const ph = planeMetrics.planeHeight;

        this.geometry = new PlaneGeometry(pw, ph, 1, 1);

        (this.uniforms.uPlaneSize as IUniform<Vector2>).value.set(pw, ph);
        // this.uniforms.uPlaneSize.needsUpdate = true;

        const translateToLeft = -width / 2 + planeMetrics.planeWidth / 2;
        const x = translateToLeft + planeMetrics.x;

        const space = planeMetrics.space;

        return {
            x,
            space,
        };
    }

    public ouResize(winW: number, winH: number): void {
        const { x, space } = this.getValue(winW, winH);

        this.meshes.forEach((mesh, i) => {
            mesh.geometry.dispose();
            if (this.geometry) mesh.geometry = this.geometry;
            mesh.position.x = x + i * space;
        });
    }

    public update(): void {
        const meshes = this.meshes;
        for (let i = 0; i < 3; i++) {
            const zoomTarget = this.hovering === i ? 1 : 0;
            const uZoom = (meshes[i].material as ShaderMaterial).uniforms.uZoom as IUniform<number>;

            const zoomChange = lerp(uZoom.value, zoomTarget, 0.1, 0.00001);
            if (zoomChange !== 0) {
                uZoom.value += zoomChange;
                // uZoom.needsUpdate = true;
            }
        }
    }
}
