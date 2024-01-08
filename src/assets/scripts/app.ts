import { Scene } from './modules/Scene';

export class App {
    private scene: Scene | null = null;

    constructor() {

        this.init();

        // window.addEventListener('resize', () => {
        //     this.onResize();
        // })
    }

    private init() {
        this.scene = new Scene();

    }

    private onResize() {
        if(this.scene) this.scene.resize();
    }
}
