import {
    Color,
    Mesh,
    // PlaneGeometry,
    RawShaderMaterial,
    Vector2,
    EventDispatcher,
    SphereGeometry,
    MeshMatcapMaterial,
    BufferGeometry,
    BufferAttribute,
    PointsMaterial,
    Points,
    MeshBasicMaterial,
} from 'three';

import { Base } from '../base';

import vertexShader from '../../glsl/background/vertex.glsl';
import fragmentShader from '../../glsl/background/fragment.glsl';
import { LoaderManager } from '../LoadManager';

export class Scene extends Base {
    animeFrameId: number | undefined;
    eventDispatcher: EventDispatcher;
    loader: LoaderManager;

    constructor() {
        super();
        this.el = document.querySelector('.scene');
        this.eventDispatcher = new EventDispatcher();
        this.loader = new LoaderManager();

        void this.init();
    }

    private async init(): Promise<void> {
        this.onDispose();

        await this.initLoader();

        this.perspectiveCamera = this.initPerspectiveCamera();

        if (!this.el) return;
        this.renderer = this.initRenderer({
            canvas: this.el as HTMLCanvasElement,
        });

        this.resize();

        // this.geometry = new PlaneGeometry(2, 2);
        // this.material = this.initMaterial();
        // this.mesh = new Mesh(this.geometry, this.material);

        // if (this.scene) this.scene.add(this.mesh);

        // this.setSphere();
        this.setParticlesGrid();

        this.initAxesHelper();

        this.render();
    }

    private async initLoader() {
        const assets = [
            {
                name: 'matcap',
                texture: './assets/images/matcap.png',
            },
        ];

        await this.loader.load(assets);
    }

    private setSphere() {
        const geometry = new SphereGeometry(1, 32, 32);
        const material = new MeshMatcapMaterial({ matcap: this.loader.assets['matcap'].texture });
        this.mesh = new Mesh(geometry, material);

        if (this.scene) this.scene.add(this.mesh);
    }

    private setParticlesGrid(): void {
        const geometry = new BufferGeometry();

        const nbColumns = 16;
        const nbLines = 9;

        // create a simple square shape. We duplicate the top left and bottom right
        // vertices because each vertex needs to appear once per triangle.
        const vertices = new Float32Array( [
            -1.0, -1.0,  1.0, // v0
            1.0, -1.0,  1.0, // v1
            1.0,  1.0,  1.0, // v2

            1.0,  1.0,  1.0, // v3
            -1.0,  1.0,  1.0, // v4
            -1.0, -1.0,  1.0  // v5
        ] );

        // itemSize = 3 because there are 3 values (components) per vertex
        geometry.setAttribute('position', new BufferAttribute(vertices, 3));
        const material = new MeshBasicMaterial({ color: 0xff0000 });
        const mesh = new Mesh(geometry, material);
        this.scene?.add(mesh);
    }

    // private initMaterial(): RawShaderMaterial {
    //     const uniforms = {
    //         uTime: {
    //             value: 0,
    //         },
    //         uScroll: {
    //             value: 0,
    //         },
    //         uColor1: {
    //             value: new Color('#1a4465'),
    //         },
    //         uColor2: {
    //             value: new Color('#e75862'),
    //         },
    //         uResolution: {
    //             value: new Vector2(this.el?.offsetWidth),
    //         },
    //     };

    //     const material = new RawShaderMaterial({
    //         uniforms,
    //         vertexShader,
    //         fragmentShader,
    //     });

    //     return material;
    // }

    private render() {
        this.stats?.begin();

        this.elapsedTime = this.clock.getElapsedTime();

        // if (!this.material) return;
        // this.material.uniforms.uTime.value = this.elapsedTime;

        if (this.scene && this.perspectiveCamera) {
            this.renderer?.render(this.scene, this.perspectiveCamera);
        }

        this.stats?.end();
        this.animeFrameId = requestAnimationFrame(() => this.render());
    }

    public resize(): void {
        const width = window.innerWidth;
        const height = window.innerHeight;
        if (!this.renderer) return;
        this.renderer.setSize(width, height);

        if (this.material) {
            this.material.uniforms.uResolution.value = new Vector2(width, height);
        }
    }

    private onDispose(): void {
        if (this.animeFrameId !== undefined) {
            cancelAnimationFrame(this.animeFrameId);
            this.animeFrameId = undefined;
        }

        this.dispose();
    }
}
