import { Texture } from 'three';
import { easeOutQuad, easeOutSine } from '../../utils/easing';

type Param = {
    debug: boolean;
};

type PointItem = {
    x: number;
    y: number;
    // 波紋の発生順
    age: number;
    force: number;
    vx: number;
    vy: number;
};

const SIZE = 64;
const MAX_AGE = 64;

export class TouchTexture {
    private points: PointItem[];
    // 波紋の最大半径
    private radius: number;
    private size: {
        width: number;
        height: number;
    };
    private canvas: HTMLCanvasElement | null = null;
    private ctx: CanvasRenderingContext2D | null = null;
    private last: {
        x: number;
        y: number;
    } | null = null;
    public texture: Texture | null = null;

    constructor(options: Partial<Param> = {}) {
        this.points = [];
        this.radius = SIZE * 0.1;
        this.size = {
            width: SIZE,
            height: SIZE,
        };

        if (options.debug) {
            this.size.width = window.innerWidth;
            this.size.height = window.innerHeight;
            this.radius = this.size.width * 0.1;
        }

        this.initTexture();
        if (!this.canvas) return;
        if (options.debug) document.querySelector('.app')?.append(this.canvas);
    }

    public initTexture(): void {
        this.canvas = document.createElement('canvas');
        this.canvas.id = 'TouchTexture';
        this.canvas.width = this.size.width;
        this.canvas.height = this.size.height;
        this.ctx = this.canvas.getContext('2d');

        this.clear();
        this.texture = new Texture(this.canvas);
    }

    private clear(): void {
        if (!this.canvas || !this.ctx) return;
        // 図形を塗りつぶす際に使用するスタイル
        this.ctx.fillStyle = '#000';
        // 塗りつぶされた矩形(長方形)を描く
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    public addPoint(point: { x: number; y: number }): void {
        let force = 0;
        let vx = 0;
        let vy = 0;
        const last = this.last;
        if (last != null) {
            /**
             * 例)
             *  | ①(1,0)
             *  |  |
             *  |__|____②(3, 3)
             *
             *  ② - ① (1つ前の位置が[last]に入っているため)
             *  relativeX = 3 - 1 = 2
             *  relativeY = 3 - 0 = 3
             *
             *  ・①〜②の距離(distance)の求め方
             *  √(x * x(横) + y * y(縦))
             *
             * √ 2 * 2 + 3 * 3 = √13
             */
            const relativeX = point.x - last.x;
            const relativeY = point.y - last.y;

            const distanceSquared = relativeX * relativeX + relativeY * relativeY;
            // Math.sqrt: 平方根(√)
            const distance = Math.sqrt(distanceSquared);
            /**
             * 単位ベクトル(大きさが１であるベクトル)を求める
             * ベクトルの大きさ(distance)で割ると、単位ベクトルが出る
             * https://study-line.com/vector-tani/
             *
             * 例)
             * vx = 2 / √13
             * vy = 3 / √13
             */
            vx = relativeX / distance;
            vy = relativeY / distance;

            // 例) Math.min(13 * 100000, 1) = 1;
            force = Math.min(distanceSquared * 10000, 1);
        }

        this.last = {
            x: point.x,
            y: point.y,
        };

        this.points.push({ x: point.x, y: point.y, age: 0, force, vx, vy });
    }

    public update(): void {
        this.clear();
        // A. 0.015625
        const agePart = 1.0 / MAX_AGE;
        this.points.forEach((point, i) => {
            // 古いほど遅くなる(数値は小さくなる) ... 1.0 - (1 / 64) = 0.9843.. 〜 1.0 - (64 / 64) = 0.0
            const slowAsOlder = 1.0 - point.age / MAX_AGE;
            const force = point.force * agePart * slowAsOlder;
            point.x += point.vx * force;
            point.y += point.vy * force;
            point.age += 1;
            // console.log(i, point);

            if (point.age > MAX_AGE) {
                // インデックス i 番目 から、1つ削除
                this.points.splice(i, 1);
            }
        });

        this.points.forEach((point) => {
            this.drawPoint(point);
        });

        if (this.texture) this.texture.needsUpdate = true;
    }

    private drawPoint(point: PointItem) {
        if (!this.ctx) return;

        // 正規化された位置をキャンバス座標に変換
        const pos = {
            x: point.x * this.size.width,
            y: point.y * this.size.height,
        };

        const radius = this.radius;
        const ctx = this.ctx;

        let intensity = 1;
        // 波紋発生から経過時間が経つほど波紋が消えていく
        // intensity = 1 - point.age / MAX_AGE;
        // MAX_AGE * 0.3 = 19.2, 19より新しかったら
        if (point.age < MAX_AGE * 0.3) {
            // ease-out: 後半早い
            // ・1 ~ 19
            // 1 / 19.2 = 0.052(薄い) ... 19 / 19.2 = 0.9895833333(濃い)
            // 古い(消えるの早い)順➡︎新しい順で、ゆっくり早くなっている
            intensity = easeOutSine(point.age / (MAX_AGE * 0.3), 0, 1, 1);
        } else {
            // ・20 ~ 64
            // 1 - ((20 - 19.2) / (44.8)) = 0.9821428571(濃い) ... 1 - ((64 - 19.2) / (44.8)) = 0(透明)
            intensity = easeOutQuad(1 - (point.age - MAX_AGE * 0.3) / (MAX_AGE * 0.7), 0, 1, 1);
        }

        // forceをかけて弱める
        intensity *= point.force;

        // let color = '255, 255, 255';
        /**
         * 単位ベクトルの範囲 (-1 ～ 1)
         * (1 + 1) / 2 * 255 = 255 ... (-1 + 1) / 2 * 255 = 0
         */
        const red = ((point.vx + 1) / 2) * 255;
        const green = ((point.y + 1) / 2) * 255;
        /**
         * 強度の範囲 (0 ～ 1)
         * 0 * 255 = 0 ... 1 * 255 = 255
         */
        const blue = intensity * 255;
        const color = `${red}, ${green}, ${blue}`;

        const offset = this.size.width * 5;

        ctx.shadowOffsetX = offset;
        ctx.shadowOffsetY = offset;
        ctx.shadowBlur = radius * 1;
        ctx.shadowColor = `rgba(${color}, ${0.2 * intensity})`;

        this.ctx.beginPath();
        this.ctx.fillStyle = 'rgba(255, 0, 0.1)';
        // 円(弧)を描画する
        this.ctx.arc(pos.x - offset, pos.y - offset, radius, 0, Math.PI * 2);
        this.ctx.fill();
    }
}
