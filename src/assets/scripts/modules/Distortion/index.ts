import { Color, Mesh, MeshBasicMaterial, PlaneGeometry, Raycaster, ShaderMaterial, Uniform } from 'three';
import { EffectComposer, RenderPass, EffectPass } from 'postprocessing';

import { TouchTexture } from '../TouchTexture';
import { Base } from '../base';
import { Planes } from '../Planes';
import { WaterEffect } from '../WaterEffect';
import { LoaderCheck } from '../LoaderCheck';

import vertexShader from '../../glsl/distortion/vertex.glsl';
import fragmentShader from '../../glsl/distortion/fragment.glsl';

type ViewSizeOption = {
    width: number;
    height: number;
};

export class Distortion extends Base {
    private touchTexture: TouchTexture | null = null;
    private composer: EffectComposer | null = null;
    private raycaster: Raycaster | null = null;
    private assets: Object = {};
    private hitObjects: Mesh[] = [];
    private data: {
        text: string[];
        images: string[];
    } | null = null;
    private subjects: Planes[] = [];
    private waterEffect: WaterEffect | null = null;
    private loaderCheck: LoaderCheck | null = null;

    constructor() {
        super();
        this.touchTexture = new TouchTexture({ debug: true });
        this.el = document.querySelector('.distortion');

        this.setup();
    }

    private setup(): void {
        this.renderer = this.initRenderer({
            antialias: false,
        });
        if (this.renderer) {
            this.el!.appendChild(this.renderer.domElement);
            // ポストプロセッシング
            // 参考にしたサイト：https://blog.design-nkt.com/osyare-threejs11/
            // コンポーザーを生成
            this.composer = new EffectComposer(this.renderer);
        }

        this.perspectiveCamera = this.initPerspectiveCamera();
        this.perspectiveCamera.position.z = 50;

        this.scene!.background = new Color(0x161624);

        this.raycaster = new Raycaster();

        this.data = {
            text: ['WEBGL'],
            images: ['/assets/images/image01.jpg'],
        };

        this.subjects = [new Planes(this, this.data.images)];

        this.tick();
        window.addEventListener('mousemove', this.onMouseMove.bind(this));
        window.addEventListener('resize', this.onResize.bind(this));

        this.loaderCheck = new LoaderCheck();
        this.loadAssets().then(this.init);
    }

    private onResize(): void {
        const winW = window.innerWidth;
        const winH = window.innerHeight;

        if (!this.perspectiveCamera) return;
        this.perspectiveCamera.aspect = winW / winH;
        this.perspectiveCamera.updateProjectionMatrix();

        this.composer?.setSize(winW, winH);
        this.subjects.forEach((subject) => {
            subject.ouResize(winW, winH);
        });
    }

    private onMouseMove(e: MouseEvent): void {
        /**
         *  (0,0)|         (3,0)
         *       |
         *  (0,3)|________ (3,3)
         */
        const point = {
            // https://blog.design-nkt.com/osyare-threejs13/
            x: e.clientX / window.innerWidth,
            y: e.clientY / window.innerHeight,
        };

        this.touchTexture?.addPoint(point);
    }

    private tick(): void {
        if (!this.touchTexture) return;
        this.touchTexture.update();
        requestAnimationFrame(this.tick.bind(this));
    }

    private init(): void {
        if (this.touchTexture) this.touchTexture.initTexture();
        this.initTextPlane();
        this.addHitPlane();
        this.subjects.forEach((subject) => subject.init());
        this.initComposer();
    }

    private initTextPlane(): void {
        if (!this.touchTexture) return;

        const viewSize = this.getViewSize();

        const geometry = new PlaneGeometry(viewSize.width, viewSize.height, 1, 1);

        const uniforms = {
            uMap: new Uniform(this.touchTexture.texture),
            uLines: new Uniform(5),
            uLineWidth: new Uniform(0.01),
            uLineColor: new Uniform(new Color(0x202030)),
        };

        const material = new ShaderMaterial({
            uniforms,
            transparent: true,
            vertexShader,
            fragmentShader,
        });

        const mesh = new Mesh(geometry, material);
        mesh.position.z = -0.001;
        this.scene?.add(mesh);
    }

    // ホバー&タッチ検知用のプレーンを追加
    private addHitPlane(): void {
        const viewSize = this.getViewSize();
        const geometry = new PlaneGeometry(
            viewSize.width, //
            viewSize.height, //
            1, //
            1 //
        );
        const material = new MeshBasicMaterial();
        const mesh = new Mesh(geometry, material);
        this.hitObjects.push(mesh);
    }

    // ポストプロセッシング
    private initComposer(): void {
        if (!this.scene || !this.perspectiveCamera) return;
        //レンダーパスを生成
        const renderPass = new RenderPass(this.scene, this.perspectiveCamera);
        if (!this.touchTexture || !this.touchTexture.texture) return;
        this.waterEffect = new WaterEffect({ texture: this.touchTexture.texture });
        const waterPass = new EffectPass(this.perspectiveCamera, this.waterEffect);
        // renderToScreen: エフェクトをかけいた映像を画面に映す
        renderPass.renderToScreen = true;
        waterPass.renderToScreen = true;
        this.composer?.addPass(renderPass);
        this.composer?.addPass(waterPass);
    }

    private loadAssets(): Promise<void> {
        return new Promise((resolve, reject) => {
            const loaderCheck = this.loaderCheck;
            if (!loaderCheck) {
                reject();
            } else {
                this.subjects.forEach((subject) => subject.load(loaderCheck));

                loaderCheck!.onComplete = () => {
                    resolve();
                };
            }
        });
    }

    public getViewSize(): ViewSizeOption {
        const fov = (this.perspectiveCamera!.fov * Math.PI) / 180;
        // 正の数を返す
        const height = Math.abs(this.perspectiveCamera!.position.z * Math.tan(fov / 2) * 2);
        return { width: height * this.perspectiveCamera!.aspect, height };
    }
}
