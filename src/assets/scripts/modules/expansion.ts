import {
    Mesh,
    Vector2,
    // BufferGeometry,
    PlaneGeometry,
    // MeshBasicMaterial,
    Color,
    ShaderMaterial,
    DoubleSide,
    TextureLoader,
    Texture,
} from 'three';
import gsap, { Power2 } from 'gsap';
import { Base } from './base';

import vertexShader from '../glsl/expansion/vertex.glsl';
import fragmentShader from '../glsl/expansion/fragment.glsl';

type UniformOptions = {
    [uniform: string]: THREE.IUniform;
};

export class Expansion extends Base {
    cardList: NodeListOf<HTMLElement>;
    itemIndex: number;
    uniforms: UniformOptions;
    state: string;
    animating: boolean;
    isAnimating: boolean;
    texture: Texture | null;
    closeBtn: HTMLButtonElement | null;
    body: HTMLBodyElement | null;

    constructor({ el }: { el: HTMLElement }) {
        super();
        this.el = el;
        this.cardList = document.querySelectorAll('.card');
        this.itemIndex = -1;
        this.uniforms = {};
        this.state = 'grid';
        this.animating = false;
        this.isAnimating = false;
        this.texture = null;
        this.closeBtn = document.querySelector('[data-close]');
        this.body = document.querySelector('body');

        this.init();
    }

    private init(): void {
        this.dispose();

        if (this.scene == null) return;

        this.perspectiveCamera = this.initPerspectiveCamera();
        this.scene.add(this.perspectiveCamera);

        this.renderer = this.initRenderer();
        if (this.renderer) this.el?.appendChild(this.renderer.domElement);

        this.uniforms = {
            // アニメーションの進行
            uProgress: {
                value: 0.0,
            },
            // メッシュのスケール
            uMeshScale: {
                value: new Vector2(1, 1),
            },
            // 中心からのメッシュの位置
            uMeshPosition: {
                value: new Vector2(0, 0),
            },
            // カメラ視野のサイズ
            uViewSize: {
                value: new Vector2(1, 1),
            },
            uColor: {
                value: new Color('#70d872'),
            },
            uResolution: {
                value: new Vector2(0, 0),
            },
            uImageResolution: {
                value: new Vector2(1280, 850),
            },
            uTexture: {
                value: null,
            },
        };

        this.resize();

        // ビューポート計算
        this.viewport = this.initViewport();
        this.uniforms.uViewSize.value.x = this.viewport.width;
        this.uniforms.uViewSize.value.y = this.viewport.height;

        this.mesh = this.initMesh();
        this.scene.add(this.mesh);

        this.cardList.forEach((card, i) => {
            card.addEventListener('mousedown', (e) => this.clickItem(e, i));
        });
    }

    async setTexture(index: number) {
        return new Promise((resolve) => {
            const imageSrc = `assets/images/image0${index}.jpg`;
            const textureLoader = new TextureLoader();
            textureLoader.load(imageSrc, async (texture) => {
                this.texture = texture;
                resolve(texture);
            });
        });
    }

    private initMesh(): Mesh {
        const segment = 128;
        this.geometry = new PlaneGeometry(1, 1, segment, segment);
        // this.meshBasicMaterial = new MeshBasicMaterial({
        //     color: 0x000000,
        // });
        this.material = new ShaderMaterial({
            uniforms: this.uniforms,
            vertexShader,
            fragmentShader,
            side: DoubleSide,
        });

        const mesh = new Mesh(this.geometry, this.material);
        mesh.scale.x = 0.00001;
        mesh.scale.y = 0.00001;

        return mesh;
    }

    private async clickItem(_: MouseEvent, index: number): Promise<void> {
        this.itemIndex = index;
        this.updateMesh();
        await this.setTexture(this.itemIndex + 1);
        this.uniforms.uTexture.value = this.texture;
        this.render();
        this.toFullScreen();
    }

    private updateMesh() {
        if (this.itemIndex === -1) return;

        const item = this.cardList[this.itemIndex];
        const rect = item.getBoundingClientRect();

        const winW = window.innerWidth;
        const winH = window.innerHeight;
        const viewportW = this.viewport.width;
        const viewportH = this.viewport.height;

        this.uniforms.uResolution.value = new Vector2(rect.width, rect.height);

        // ピクセル単位をカメラの視野単位(viewportのサイズ)にマッピングする
        const widthViewUnit = (rect.width * viewportW) / winW; // ← (rect.width / winW) * (viewportW / winW) てことかな？
        const heightViewUnit = (rect.height * viewportH) / winH;
        let xViewUnit = (rect.left * this.viewport.width) / winW;
        let yViewUnit = (rect.top * this.viewport.height) / winH;

        // 単位の基準を左上ではなく中央にする
        xViewUnit = xViewUnit - viewportW / 2;
        yViewUnit = yViewUnit - viewportH / 2;

        // 位置の原点は左上ではなく平面の中心にする
        const x = xViewUnit + widthViewUnit / 2;
        const y = -yViewUnit - heightViewUnit / 2;

        // 上記、新しい値を使用し、メッシュを拡大縮小して配置
        const mesh = this.mesh as Mesh;
        mesh.scale.x = widthViewUnit;
        mesh.scale.y = heightViewUnit;
        mesh.position.x = x;
        mesh.position.y = y;

        // フラグメントシェーダーではスケールの前に値が必要なので、スケールで割る
        this.uniforms.uMeshPosition.value.x = x / widthViewUnit;
        this.uniforms.uMeshPosition.value.y = y / heightViewUnit;

        this.uniforms.uMeshScale.value.x = widthViewUnit;
        this.uniforms.uMeshScale.value.y = heightViewUnit;

        // const styles = window.getComputedStyle(item);
        // let color = styles.getPropertyValue('background-color')
    }

    private toGrid() {
        if (this.state === 'grid' || this.isAnimating) return;

        this.animating = true;
        const tl = gsap.timeline({
            paused: true,
            defaults: {
                ease: Power2.easeOut,
            },
        });
        tl.to(this.closeBtn, {
            duration: 0.3,
            opacity: 0,
            onStart: () => {
                if (this.closeBtn) this.closeBtn.setAttribute('data-close', 'disable');
                if (this.body) this.body.style.position = 'initial';
            },
        });
        tl.to(
            this.uniforms.uProgress,
            {
                duration: 1,
                value: 0,
                onUpdate: () => this.render(),
                onComplete: () => {
                    this.isAnimating = false;
                    this.state = 'grid';
                },
            },
            '<'
        );
        tl.to(
            this.el,
            {
                duration: 0.4,
                opacity: 0,
                onComplete: () => {
                    if (this.el) this.el.style.zIndex = '-1';
                },
            },
            '<0.3'
        );
        tl.play();
    }

    private toFullScreen() {
        if (this.el == null || this.state === 'fullscreen' || this.isAnimating) return;

        this.animating = true;

        const tl = gsap.timeline({
            paused: true,
            defaults: {
                ease: Power2.easeOut,
            },
        });
        tl.to(this.uniforms.uProgress, {
            duration: 1,
            value: 1,
            onStart: () => {
                if (this.el) {
                    this.el.style.zIndex = '2';
                    this.el.style.opacity = '1';
                }
            },
            onUpdate: () => {
                this.render();
            },
        });
        tl.to(
            this.closeBtn,
            {
                duration: 0.5,
                opacity: 1,
                onStart: () => {
                    if (this.closeBtn) this.closeBtn.setAttribute('data-close', 'active');
                    if (this.body) this.body.style.position = 'fixed';
                },
                onComplete: () => {
                    this.isAnimating = false;
                    this.state = 'fullscreen';

                    if (this.closeBtn) {
                        this.closeBtn.style.pointerEvents = 'auto';
                        this.closeBtn.addEventListener('click', () => {
                            this.toGrid();
                        });
                    }
                },
            },
            '<0.5'
        );
        tl.play();
    }

    public resize(): void {
        const width = window.innerWidth;
        const height = window.innerHeight;

        if (!this.perspectiveCamera || !this.renderer) return;
        // カメラのアスペクト比を正す
        this.perspectiveCamera.aspect = width / height;
        this.perspectiveCamera.updateProjectionMatrix();

        this.renderer.setSize(width, height);

        this.viewport = this.initViewport();
        this.uniforms.uViewSize.value.x = this.viewport.width;
        this.uniforms.uViewSize.value.y = this.viewport.height;

        this.updateMesh();
        this.render();
    }

    public render() {
        if (this.scene && this.perspectiveCamera) {
            this.renderer?.render(this.scene, this.perspectiveCamera);
        }
    }
}
