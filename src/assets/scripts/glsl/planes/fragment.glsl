uniform float uZoom;
uniform float uZoomDelta;
uniform float uMouse;

uniform vec2 uPlaneSize;
uniform sampler2D uImage;
uniform vec2 uImageSize;

varying vec2 vUv;

vec2 withRatio(vec2 uv, vec2 canvasSize, vec2 textureSize) {
    vec2 ratio = vec2(
        min((canvasSize.x / canvasSize.y) / (textureSize.x / textureSize.y), 1.0),
        min((canvasSize.y / canvasSize.x) / (textureSize.y / textureSize.x), 1.0)
    );

    return vec2(
        uv.x * ratio.x + (1.0 - ratio.x) * 0.5,
        uv.y * ratio.y + (1.0 - ratio.y) * 0.5
    );
}

vec3 grayScale(vec3 color) {
    return vec3(color.r + color.g + color.b) / 5.0;
}

void main() {
    vec2 uv = vUv;
    uv -= 0.5;
    uv * 1.0 - uZoomDelta * uZoom;
    // uv += uZoomDelta * (uMouse - 0.5) * 0.5 * uZoom;
    uv += 0.5;
    uv = withRatio(uv, uPlaneSize, uImageSize);
    vec3 tex = texture2D(uImage, uv).xyz;
    vec3 color = vec3(0.2 + (uZoom * 0.5));
    color = mix(grayScale(tex) * 0.5, tex, uZoom);
    gl_FragColor = vec4(color, 1.0);
}