import { Distortion } from './modules/Distortion';
import { Scene } from './modules/Scene/index';

export class App {
    private scene: Scene | null = null;
    protected distortion: Distortion | null = null;

    constructor() {
        this. distortion = new Distortion()

        // window.addEventListener('resize', () => {
        //     this.onResize();
        // })

        this.init();
    }

    private init() {
        // this.scene = new Scene();
    }

    private onResize(): void {
        if (this.scene) this.scene.resize();
    }
}
