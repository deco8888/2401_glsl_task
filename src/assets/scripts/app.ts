import { Distortion } from './modules/Distortion';

export class App {
    protected distortion: Distortion | null = null;

    constructor() {
        this.init();
    }

    private init() {
        this.distortion = new Distortion();
        window.addEventListener('resize', this.onResize.bind(this));
    }

    private onResize(): void {
        if (this.distortion) this.distortion.resize();
    }
}
