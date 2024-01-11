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
    ShaderMaterial,
} from 'three';

import { Base } from '../base';

import vertexShader from '../../glsl/scene/main.vert';
import fragmentShader from '../../glsl/scene/main.frag';
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

        this.initControls();

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

        const multiplier = 18;
        // 16 / 9
        const nbColumns = 16 * multiplier;
        const nbRows = 9 * multiplier;
        const vertices: number[] = [];

        for (let i = 0; i < nbColumns; i++) {
            for (let j = 0; j < nbRows; j++) {
                const point = [i, j, 0];

                vertices.push(...point);
            }
        }

        // console.log(vertices);

        // create a simple square shape. We duplicate the top left and bottom right
        // vertices because each vertex needs to appear once per triangle.
        const vertices1 = new Float32Array([
            -1.0,
            -1.0,
            0.0, // v0
            1.0,
            -1.0,
            0.0, // v1
            1.0,
            1.0,
            0.0, // v2
            -1.0,
            1.0,
            0.0, // v5
        ]);

        const vertices32 = new Float32Array(vertices);

        // itemSize = 3 because there are 3 values (components) per vertex
        geometry.setAttribute('position', new BufferAttribute(vertices32, 3));
        geometry.center();

        // const material = new PointsMaterial({ color: 0xff0000 });
        // const mesh = new Points(geometry, material);

        const material = new ShaderMaterial({
            vertexShader,
            fragmentShader,
            uniforms: {
                uPointSize: {value: 5.0}
            }
        });
        const mesh = new Points(geometry, material);

        this.scene?.add(mesh);
    }

    private render() {
        this.stats?.begin();

        // this.elapsedTime = this.clock.getElapsedTime();

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
