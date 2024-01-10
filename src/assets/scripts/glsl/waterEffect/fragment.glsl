uniform sampler2D uTexture;
#define PI 3.14159265359;

void mainUv(inout vec2 uv) {
    vec4 tex = texture2D(uTexture, uv);
    float angle = -((tex.r) * PI * 2.0) - PI);
    float vx = -(tex.r * 2.0 - 1.0);
    float vy = -(tex.g * 2.0 - 1.0);
    float intensity = tex.b;
    uv.x += vx * 0.2 * intensity;
    uv.y += vy * 0.2 * intensity;
}