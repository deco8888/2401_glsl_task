uniform sampler2D uMap;
uniform float uLines;
uniform float uLineWidth;
uniform vec3 uLineColor;

varying vec2 vUv;

void main() {
    vec3 color = vec3(1.0);
    color = vec3(0.0);
    // step(a, x): aは閾値、xはチェックされる値。しきい値未満の場合は0.0を、それ以上の場合は1.0の二値化を行う関数
    // fract(x): x-floor(x)を返す
    float line = step(0.5 - uLineWidth / 2.0, fract(vUv.x * uLines)) - step(0.5 + uLineWidth / 2.0, fract(vUv.x * uLines));
}