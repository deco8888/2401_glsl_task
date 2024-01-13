import { Mesh, MeshBasicMaterial } from 'three';
import { Font, FontLoader } from 'three/examples/jsm/loaders/FontLoader.js';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js';
import { Distortion } from '../Distortion';

import { LoaderCheck } from '../LoaderCheck';

const FONT_DANCING_SCRIPT_BOLD = 'dancing_script_bold.json';

export class Text {
    private distortion: Distortion;
    private text: string[];
    private fonts: Font[] = [];
    public textList: Mesh[] = [];
    protected initiated: boolean;

    constructor(distortion: Distortion, text: string[]) {
        this.distortion = distortion;
        this.text = text;
        this.initiated = false;
    }

    public async load(loaderCheck: LoaderCheck): Promise<void> {
        await Promise.all(
            this.text.map(async (_, i) => {
                loaderCheck.begin(`text-${i}`);
                await this.setFont(i);
                loaderCheck.end(`text-${i}`);
            })
        );
    }

    private setFont(i: number): Promise<null> {
        return new Promise((resolve) => {
            const fontLoader = new FontLoader();
            fontLoader.load(`assets/fonts/${FONT_DANCING_SCRIPT_BOLD}`, (font) => {
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
            const mesh = this.createText(i, this.text[i]);
            this.textList.push(mesh);

            if(i === 0) this.distortion.scene?.add(mesh);
        }
    }

    private createText(i: number, text: string): Mesh {
        const geometry = new TextGeometry(text, {
            font: this.fonts[i],
            size: 8.0,
            height: 0.0,
        });
        geometry.center();

        const material = new MeshBasicMaterial({ color: 0xffffff });
        const mesh = new Mesh(geometry, material);
        mesh.name = 'text';
        return mesh;
    }

    /* eslint-disable @typescript-eslint/no-empty-function, no-unused-vars, @typescript-eslint/no-unused-vars */
    public ouResize(_winW: number, _winH: number): void {}

    public onMouseMove(_e: Partial<MouseEvent>): void {}

    public update(): void {}
    /* eslint-enable */

    public changeText(index: number): void {
        const target = this.distortion.scene?.getObjectByName('text');
        if (target) {
            this.distortion.scene?.remove(target);
        }
        this.distortion.scene?.add(this.textList[index]);
    }
}
