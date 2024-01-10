import { Effect } from 'postprocessing';
import { Texture, Uniform } from 'three';

import fragmentShader from '../../glsl/waterEffect/fragment.glsl';

type Params = {
    texture: Texture;
};

export class WaterEffect extends Effect {
    constructor(options: Partial<Params> = {}) {
        super('WaterEffect', fragmentShader, {
            uniforms: new Map([['uTexture', new Uniform(options.texture)]]),
        });
    }
}
