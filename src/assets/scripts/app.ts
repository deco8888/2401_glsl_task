import { Scene } from './modules/Scene/index';
import { WaterTexture } from './modules/WaterTexture';

export class App {
    private scene: Scene | null = null;
    private waterTexture: WaterTexture | null = null;

    constructor() {
        this.waterTexture = new WaterTexture({ debug: true });

        // window.addEventListener('resize', () => {
        //     this.onResize();
        // })

        this.init();
    }

    private init() {
        // this.scene = new Scene();
        window.addEventListener('mousemove', this.onMouseMove.bind(this));
        this.tick();
    }

    private onResize(): void {
        if (this.scene) this.scene.resize();
    }

    private onMouseMove(e: MouseEvent): void {
        const point = {
            x: e.clientX / window.innerWidth,
            y: e.clientY / window.innerHeight
        }

        this.waterTexture?.addPoint(point)
    }

    private tick(): void {
        if(!this.waterTexture) return;
        this.waterTexture.update()
        requestAnimationFrame(this.tick.bind(this));
    }
}
