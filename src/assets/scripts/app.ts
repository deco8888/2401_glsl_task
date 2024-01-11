import { Distortion } from './modules/Distortion';
import { Scene } from './modules/Scene/index';

export class App {
    private scene: Scene | null = null;
    protected distortion: Distortion | null = null;

    constructor() {
        window.addEventListener('resize', this.onResize.bind(this));
        this.init();
    }

    private init() {
        // this.scene = new Scene();
        this.distortion = new Distortion();
    }

    private onResize(): void {
        if (this.scene) this.scene.resize();
        if (this.distortion) this.distortion.resize();
    }
}
