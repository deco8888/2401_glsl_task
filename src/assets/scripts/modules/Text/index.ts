import { Mesh, MeshBasicMaterial } from 'three';
import { Font, FontLoader } from 'three/examples/jsm/loaders/FontLoader.js';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js';
import { Distortion } from '../Distortion';

import { LoaderCheck } from '../LoaderCheck';

const FONT_ZEN_OLD_MINCHO = 'zen_old_mincho_bold.json';
const FONT_M_PLUS_1p_BOLD = 'm_plus_1p_bold.json';
const FONT_EXO_BOLD = 'exo_bold.json';

export class Text {
    private distortion: Distortion;
    private text: string[];
    private fonts: Font[] = [];
    public textList: Mesh[] = [];
    private initiated: boolean = false;

    constructor(distortion: Distortion, text: string[]) {
        this.distortion = distortion;
        this.text = text;
    }

    public async load(loaderCheck: LoaderCheck): Promise<void> {
        await Promise.all(
            this.text.map(async (_, i) => {
                loaderCheck.begin(`text-${i}`);
                await this.setFont(i);
                console.log(this.fonts);
                loaderCheck.end(`text-${i}`);
            })
        );
    }

    private setFont(i: number): Promise<null> {
        return new Promise((resolve) => {
            const fontLoader = new FontLoader();
            fontLoader.load(`assets/fonts/${FONT_EXO_BOLD}`, (font) => {
                this.fonts[i] = font;
                resolve(null);
            });
        });
    }

    public init(): void {
        this.initiated = true;

        this.initMesh();
    }

    private initMesh(): void {
        for (let i = 0; i < this.text.length; i++) {
            const text = this.text[i];

            const geometry = new TextGeometry(text, {
                font: this.fonts[i],
                size: 8.0,
                height: 0.0,
            });
            geometry.center();

            const material = new MeshBasicMaterial({ color: 0xffffff });
            const mesh = new Mesh(geometry, material);
            this.textList.push(mesh);
            // this.distortion.scene?.add(mesh);
        }
    }

    public ouResize(_winW: number, _winH: number): void {}

    public onMouseMove(_e: Partial<MouseEvent>): void {}

    public update(): void {}
}
