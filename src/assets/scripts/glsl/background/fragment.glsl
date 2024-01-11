precision mediump float;

uniform vec3 uColor1;
uniform vec3 uColor2;
uniform float uTime;
uniform float uScroll;

varying vec2 vUv;

#pragma glslify: cnoise2 = require(glsl-noise/classic/2d)

void main() {
    float noise = cnoise2(vUv * 2. + 0.5 + sin(uTime / 2.));
    // mix: x(1 - a) + y * 1を返す（つまり線形補間）
    vec3 color = mix(uColor1, uColor2, noise);

    gl_FragColor.rgb = color;
    gl_FragColor.a = 1.0;
}