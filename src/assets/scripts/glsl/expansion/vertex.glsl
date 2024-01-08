precision mediump float;
uniform float uProgress;
uniform vec2 uMeshScale;
uniform vec2 uMeshPosition;
// カメラ視野のサイズ
uniform vec2 uViewSize;
uniform vec2 uReslution;

varying vec2 vUv;
varying vec2 vScale;

void main() {
    vec3 pos = position.xyz;

    float activation = uv.x;

    float latestStart = 0.5;
    float startAt = activation * latestStart;
    float vertexProgress = smoothstep(startAt, 1.0, uProgress);

    // メッシュのスケールを利用して、画面サイズに合わせた必要なスケールを計算する
    vec2 scaleToViewSize = uViewSize / uMeshScale - 1.0;
    vec2 scale = vec2(1.0 + scaleToViewSize * vertexProgress);
    vScale = scale;
    pos.xy *= scale;

    // 頂点を中心に移動させる
    pos.y += -uMeshPosition.y * vertexProgress;
    pos.x += -uMeshPosition.x * vertexProgress;

    vUv = uv;

    // projectionMatrix: 三次元空間のどの領域を撮影するのかなどを定義
    // modelViewMatrix: 被写体となる物体が三次元空間のどの位置にあるのかを定義
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);

}