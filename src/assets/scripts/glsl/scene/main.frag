float circle(vec2 uv, float border) {
    float radius = 0.5;
    float dist = radius - distance(uv, vec2(0.5));
    return smoothstep(0.0, border, dist);
}

void main() {
    gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);

    gl_FragColor.a *= circle(gl_PointCoord, 0.2);
}