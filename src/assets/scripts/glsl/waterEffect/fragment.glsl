#define pi 3.14159265359

uniform sampler2D uTexture;

void mainUv(inout vec2 uv) {
    vec4 tex = texture2D(uTexture, uv);
    float angle = -((tex.r) * (pi * 2.0) - pi);
    float vx = -(tex.r * 2.0 - 1.0);
    float vy = -(tex.g * 2.0 - 1.0);
    float intensity = tex.b;
    uv.x += vx * 0.1 * intensity;
    uv.y += vy * 0.1 * intensity;
}