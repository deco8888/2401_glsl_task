type Param = {
    debug: boolean;
};

type PointItem = {
    x: number;
    y: number;
    // 波紋の発生順
    age: number;
};

const SIZE = 64;
const MAX_AGE = 64;

export class WaterTexture {
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

    constructor(options: Param) {
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
        if (options.debug) document.querySelector('.app')!.append(this.canvas);
    }

    private initTexture(): void {
        this.canvas = document.createElement('canvas');
        this.canvas.id = 'WaterTexture';
        this.canvas.width = this.size.width;
        this.canvas.height = this.size.height;
        this.ctx = this.canvas.getContext('2d');
        this.clear();
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
            const relativeX = point.x - last.x;
            const relativeY = point.y - last.y;

            const distanceSquared = relativeX * relativeX + relativeY * relativeY;
            const distance = Math.sqrt(distanceSquared);
            vx = relativeX / distance;
            vy = relativeY / distance;
        }

        this.points.push({ x: point.x, y: point.y, age: 0 });
    }

    public update(): void {
        this.clear();
        this.points.forEach((point, i) => {
            point.age += 1;

            if (point.age > MAX_AGE) {
                // インデックス i 番目 から、1つ削除
                this.points.splice(i, 1);
            }
        });

        this.points.forEach((point) => {
            this.drawPoint(point);
        });
    }

    private drawPoint(point: PointItem) {
        if (!this.ctx) return;

        // 正規化された位置をキャンバス座標に変換
        let pos = {
            x: point.x * this.size.width,
            y: point.y * this.size.height,
        };

        const radius = this.radius;
        const ctx = this.ctx;

        let intensity = 1;
        // 波紋発生から経過時間が経つほど波紋が消えていく
        intensity = 1 - point.age / MAX_AGE;

        let color = '255, 255, 255';

        let offset = this.size.width * 5;

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
