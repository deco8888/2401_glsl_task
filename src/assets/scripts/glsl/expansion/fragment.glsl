precision mediump float;

uniform vec3 uColor1;
uniform vec3 uColor2;
uniform float uTime;
uniform float uScroll;
uniform sampler2D uTexture;
uniform vec2 uMeshScale;
uniform vec2 uImageResolution;

varying vec2 vUv;
varying vec2 vScale;

#pragma glslify: cnoise2 = require(glsl-noise/classic/2d)

void main() {
    // float noise = cnoise2(vUv * 2. + 0.5 + sin(uTime / 5.));
    // // mix: x(1 - a) + y * 1を返す（つまり線形補間）
    // vec3 color = mix(uColor1, uColor2, noise);

    // gl_FragColor.rgb = color;
    // gl_FragColor.a = 1.0;

    // vec2 ratio = vec2(
    //     min((u))
    // )

    vec2 ratio = vec2(min((vScale.x / vScale.y) / (uImageResolution.x / uImageResolution.y), 1.0), min((vScale.y / vScale.x) / (uImageResolution.y / uImageResolution.x), 1.0));

    vec2 uv = vec2(vUv.x * ratio.x + (1.0 - ratio.x) * 0.5, vUv.y * ratio.y + (1.0 - ratio.y) * 0.5);

    vec3 color = texture2D(uTexture, uv).rgb;

    gl_FragColor = vec4(color, 1.0);
    // gl_FragColor = vec4(vec3(0.2), 1.0);
}