import gsap from 'gsap';
import { addClass, removeClass } from '../utils/classList';
import { hasClass } from '../utils/hasClass';
import { lerp } from '../utils/math';

interface CursorOption {
    cursorSelector: string;
    targetSelector: string;
}

const defaults: CursorOption = {
    cursorSelector: '[data-cursor]',
    targetSelector: '[data-cursor-target]',
};

export class Cursor {
    params: CursorOption;
    elms: {
        cursor: HTMLElement | null;
        targets: NodeListOf<HTMLElement>;
    };
    mouse: {
        [key: string]: number;
    };
    styles: {
        [key1: string]: {
            [key2: string]: number;
        };
    };
    rect: {
        [key: string]: number;
    };
    flg: {
        isScaleUp: boolean;
    };
    constructor(props: Partial<CursorOption> = {}) {
        this.params = { ...defaults, ...props };
        this.elms = {
            cursor: document.querySelector(this.params.cursorSelector),
            targets: document.querySelectorAll(this.params.targetSelector),
        };
        this.mouse = {
            x: 0,
            y: 0,
        };
        this.styles = {
            transX: {
                previous: 0,
                current: 0,
                amt: 0.1,
            },
            transY: {
                previous: 0,
                current: 0,
                amt: 0.1,
            },
            scale: {
                previous: 0,
                current: 0,
                amt: 0.1,
            },
        };
        this.rect = {
            width: 0,
            height: 0,
        };
        this.flg = {
            isScaleUp: false,
        };
        if (this.elms.cursor) this.init();
    }
    init(): void {
        this.getRect();
        this.render();
        this.event();
    }
    // 要素の位置座標を取得
    getRect(): void {
        if (this.elms.cursor) {
            this.rect.width = this.elms.cursor.clientWidth;
            this.rect.height = this.elms.cursor.clientHeight;
        }
    }
    render(): void {
        if (this.rect) {
            this.styles.transX.current = this.mouse.x - this.rect.width * 0.5;
            this.styles.transY.current = this.mouse.y - this.rect.height * 0.5;
            this.styles.scale.current = this.flg.isScaleUp ? 3 : 1;
            for (const styles of Object.values(this.styles)) {
                styles.previous = lerp(styles.previous, styles.current, styles.amt);
            }
            gsap.set(this.elms.cursor, {
                left: this.styles.transX.previous,
                top: this.styles.transY.previous,
            });
        }
        requestAnimationFrame(() => this.render());
    }
    event(): void {
        document.addEventListener('mousemove', (e: MouseEvent) => {
            this.mouse.x = e.pageX;
            this.mouse.y = e.pageY;
        });
        this.elms.targets.forEach((target) => {
            target.addEventListener('mouseenter', () => {
                if (this.elms.cursor) {
                    const el = this.elms.cursor.querySelector('span') as HTMLSpanElement;
                    const text = target.getAttribute('data-cursor-text') as string;
                    el.innerHTML = text;
                    addClass(this.elms.cursor, hasClass.active);
                }
            });
            target.addEventListener('mouseleave', () => {
                if (this.elms.cursor) {
                    removeClass(this.elms.cursor, hasClass.active);
                    const el = this.elms.cursor.querySelector('span') as HTMLSpanElement;
                    el.innerHTML = '';
                }
            });
        });
    }
}
