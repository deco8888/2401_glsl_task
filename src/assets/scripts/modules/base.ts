import Stats from 'three/examples/jsm/libs/stats.module';
import {
    AxesHelper,
    Clock,
    Material,
    Mesh,
    MeshBasicMaterial,
    Object3D,
    OrthographicCamera,
    PerspectiveCamera,
    PlaneGeometry,
    RawShaderMaterial,
    Scene,
    ShaderMaterial,
    WebGLRenderer,
} from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

type CameraOption = {
    left: number;
    right: number;
    top: number;
    bottom: number;
    near: number;
    far: number;
};

const defaultsCamera: CameraOption = {
    left: -1,
    right: 1,
    top: 1,
    bottom: -1,
    near: 1,
    far: 1000,
};

type PerspectiveCameraOption = {
    fov: number;
    width: number;
    height: number;
    near: number;
    far: number;
    position: {
        x: number;
        y: number;
        z: number;
    };
};

const defaultPerspectiveCamera: PerspectiveCameraOption = {
    fov: 60,
    width: window.innerWidth,
    height: window.innerHeight,
    near: 0.1,
    far: 10000,
    position: { x: 0, y: 0, z: 0 },
};

type RendererOption = {
    canvas?: HTMLCanvasElement;
    alpha?: boolean;
    antialias?: boolean;
};

const defaultRenderer: RendererOption = {
    alpha: true,
    antialias: true,
};

type ThreeNumber = {
    width: number;
    height: number;
};

export class Base {
    stats: Stats | null = null;
    scene: Scene | null;
    camera: OrthographicCamera | null = null;
    perspectiveCamera: PerspectiveCamera | null = null;
    renderer: WebGLRenderer | null = null;
    el: HTMLCanvasElement | HTMLElement | null = null;
    geometry: PlaneGeometry | null = null;
    material: RawShaderMaterial | ShaderMaterial | null = null;
    meshBasicMaterial: MeshBasicMaterial | null = null;
    mesh: Mesh | null = null;
    clock: Clock;
    elapsedTime: number;
    viewport: ThreeNumber;
    controls: OrbitControls | null = null;

    constructor() {
        this.scene = new Scene();
        this.clock = new Clock();
        this.elapsedTime = 0;
        this.viewport = {
            width: 0,
            height: 0,
        };

        this.initStats();
    }

    public initStats(): void {
        this.stats = new Stats();
        this.stats.showPanel(0);
        document.body.appendChild(this.stats.dom);
    }

    public initCamera(props: Partial<CameraOption> = {}): OrthographicCamera {
        const params = { ...defaultsCamera, ...props };
        const camera = new OrthographicCamera(
            params.left,
            params.right,
            params.top,
            params.bottom,
            params.near,
            params.far
        );
        camera.position.z = 1;
        return camera;
    }

    public initPerspectiveCamera(props: Partial<PerspectiveCameraOption> = {}): PerspectiveCamera {
        const params = { ...defaultPerspectiveCamera, ...props };
        const camera = new PerspectiveCamera(params.fov, params.width / params.height, params.near, params.far);
        camera.position.set(params.position.x, params.position.y, params.position.z);
        // camera.lookAt(0, 0, 0);
        // updateProjectionMatrix: カメラの投影行列を更新。パラメータを変更した後に呼び出す必要がある。
        camera.updateProjectionMatrix();
        return camera;
    }

    public initRenderer(props: Partial<RendererOption> = {}): WebGLRenderer | null {
        if (!this.el) return null;
        const params = { ...defaultRenderer, ...props };
        const renderer = new WebGLRenderer(params);
        renderer.setPixelRatio(Math.min(2, window.devicePixelRatio));
        renderer.setSize(window.innerWidth, window.innerHeight);

        return renderer;
    }

    public dispose(): void {
        if (this.scene) {
            this.scene.children.forEach((obj) => {
                obj.traverse((obj3d) => this.disposeObj(obj3d));
            });
        }

        if (this.renderer) {
            this.renderer.dispose();
            // forceContextLoss: WebGLコンテキストの消失をシミュレート
            this.renderer.forceContextLoss();
        }

        if (this.geometry && this.material) {
            this.geometry = null;
            this.material = null;
        }
    }

    private disposeObj(obj3d: Object3D): void {
        const obj = obj3d as Mesh;

        if (obj.geometry) obj.geometry.dispose();
        if (!!obj.material && obj.material instanceof Array) {
            // マテリアルが配列の場合
            obj.material.forEach((material) => this.disposeMaterial(material));
        } else if (obj.material) {
            this.disposeMaterial(obj.material);
        }
    }

    private disposeMaterial(material: Material): void {
        material.dispose();
    }

    public initViewport(): ThreeNumber {
        if (this.perspectiveCamera && this.perspectiveCamera instanceof PerspectiveCamera) {
            const fov = this.perspectiveCamera.fov * (Math.PI / 180);
            // Math.tan(fov / 2) = 高さ / 底辺[視点〜スクリーンまでの距離] ➡︎ (高さ / 底辺) * 底辺 = 高さ
            const height = Math.abs(Math.tan(fov / 2) * this.perspectiveCamera.position.z * 2);
            const width = height * this.perspectiveCamera.aspect;
            // スクリーンサイズ
            this.viewport = {
                width,
                height,
            };
        }
        return this.viewport;
    }

    public initControls(): void {
        console.log(this.perspectiveCamera, this.renderer);
        if (!this.perspectiveCamera || !this.renderer) return;
        this.controls = new OrbitControls(this.perspectiveCamera, this.renderer.domElement);
        // 設定をtrueにするとヌルっとすべって動く
        this.controls.enableDamping = true;
    }

    public initAxesHelper(): void {
        const axesHelper = new AxesHelper(3);
        if (this.scene) this.scene.add(axesHelper);
    }
}
