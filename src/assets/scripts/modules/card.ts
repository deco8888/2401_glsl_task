import gsap from 'gsap';

import { CHARACTERS } from '../data/characters';

type Props = {
    el: HTMLElement;
    options: Options;
};

export type Options = {
    orientation: 'vertical' | 'horizontal';
    // 画像のスライス数
    slicesTotal: number;
    animation?: {
        duration: number;
        ease: string;
    };
};

export type Dom = {
    el: HTMLElement | null;
    img: HTMLElement | null;
    imgWrap: HTMLElement | null;
    slices: NodeListOf<HTMLElement> | null;
    date: HTMLElement | null;
    title: HTMLElement | null;
    link: HTMLElement | null;
};
export class Card {
    private dom: Dom;
    private setting: Options;
    private imageURL: string | RegExpMatchArray | null;
    private isVertical: boolean;
    private chars: {
        title?: NodeListOf<HTMLElement> | null;
    };

    constructor(props: Props) {
        this.dom = {
            el: props.el,
            img: props.el.querySelector('[data-card-image]'),
            imgWrap: null,
            slices: null,
            date: props.el.querySelector('[data-card-date]'),
            title: props.el.querySelector('[data-card-title]'),
            link: props.el.querySelector('[data-card-link]'),
        };
        this.setting = {
            orientation: 'vertical',
            // 画像のスライス数
            slicesTotal: 5,
            animation: {
                duration: 0.5,
                ease: 'power3.inOut',
            },
        };
        this.setting = Object.assign({}, this.setting, props.options);
        this.imageURL = null;
        this.isVertical = this.setting.orientation === 'vertical';
        this.chars = {
            title: this.dom.title?.querySelectorAll('[data-char]'),
        };

        this.init();
    }

    private init() {
        if (this.dom.img) this.imageURL = this.dom.img.getAttribute('data-card-image-url') as string;

        this.layout();
        this.event();
    }

    private layout() {
        this.dom.imgWrap = document.createElement('div');
        this.dom.imgWrap.classList.add('card__image-wrap');
        let slicesStr = '';
        for (let i = 0; i < this.setting.slicesTotal; i++) {
            slicesStr += `<div class="card__image-inner" style="background-image: url(${this.imageURL})"></div>`;
        }
        this.dom.imgWrap.innerHTML = slicesStr;
        this.dom.slices = this.dom.imgWrap.querySelectorAll('.card__image-inner');
        this.dom.img?.appendChild(this.dom.imgWrap);
        this.dom.img?.style.setProperty(this.isVertical ? '--columns' : '--rows', `${this.setting.slicesTotal}`);

        this.setClipPath();
    }

    private setClipPath() {
        if (!this.dom.slices) return;
        this.dom.slices.forEach((slice, position) => {
            let a1 = (position * 100) / this.setting.slicesTotal; // 0, 20, 40, 60, 80
            let b1 = (position * 100) / this.setting.slicesTotal + 100 / this.setting.slicesTotal; // 20, 40, 60, 80, 100

            const pattern1 = `polygon(${a1}% 0%, ${b1}% 0%, ${b1}% 100%, ${a1}% 100%)`; // 縦分割
            const pattern2 = `polygon(0% ${a1}%, 100% ${a1}%, 100% ${b1}%, 0% ${b1}%)`; // 横分割

            gsap.set(slice, {
                clipPath: this.isVertical ? pattern1 : pattern2,
                [this.isVertical ? 'left' : 'top']: position * -1,
            });
        });
    }

    private event() {
        this.dom.el?.addEventListener('mouseenter', () => this.enter());
        this.dom.el?.addEventListener('mouseleave', () => this.leave());
    }

    private enter() {
        const percent = this.isVertical ? 'yPercent' : 'xPercent';

        if (this.chars.title) this.shuffleChars(this.chars.title);

        const tl = gsap.timeline({
            defaults: {
                duration: this.setting.animation?.duration,
                ease: this.setting.animation?.ease,
            },
        });
        tl.addLabel('start', 0)
            .fromTo(
                this.dom.img,
                {
                    [percent]: 100,
                    opacity: 0,
                },
                {
                    [percent]: 0,
                    opacity: 1,
                },
                'start'
            )
            .fromTo(
                this.dom.imgWrap,
                {
                    [percent]: 0,
                },
                {
                    [percent]: 0,
                },
                'start'
            )
            .fromTo(
                this.dom.slices,
                {
                    [percent]: (pos: number) => {
                        // 余りが[1]がtrue, [0]がfalse
                        return pos % 2 ? gsap.utils.random(-75, -25) : gsap.utils.random(25, 75);
                    },
                },
                {
                    [percent]: 0,
                },
                'start'
            );
    }

    private leave() {
        const percent = this.isVertical ? 'yPercent' : 'xPercent';

        const tl = gsap.timeline({
            defaults: {
                duration: this.setting.animation?.duration,
                ease: this.setting.animation?.ease,
            },
        });
        tl.addLabel('start', 0)
            .to(
                this.dom.img,
                {
                    [percent]: 100,
                    opacity: 0,
                },
                'start'
            )
            .to(
                this.dom.imgWrap,
                {
                    [percent]: -100,
                },
                'start'
            )
            .to(
                this.dom.slices,
                {
                    [percent]: (pos: any) => {
                        return pos % 2 ? gsap.utils.random(-75, -25) : gsap.utils.random(25, 75);
                    },
                },
                'start'
            );
    }

    private shuffleChars(chars: NodeListOf<HTMLElement>) {
        chars.forEach((char, index) => {
            // killTweensOf: 強制終了だよ
            gsap.killTweensOf(char);
            gsap.fromTo(
                char,
                {
                    opacity: 0,
                },
                {
                    duration: `0.03${index}`,
                    repeat: 3,
                    //「true」を設定すると、Tweenのrepeatが無効化し、完全な反復ごとに内部的に開始/終了値を再記録する(yoyoは含まれない)
                    // x："Math.random()* CHARACTERS.length"は、繰り返しごとに新しいランダム値を取得する。※duration、delay、staggerは更新されない
                    repeatRefresh: true,
                    repeatDelay: 0.05,
                    opacity: 1,
                    onRepeat: () => {
                        char.innerHTML = CHARACTERS[Math.floor(Math.random() * CHARACTERS.length)];
                    },
                    onComplete: () => {
                        gsap.set(char, {
                            innerHTML: char.getAttribute('data-char-word'),
                            delay: `0.09${index * 3}`,
                        });
                    },
                }
            );
        });
    }
}
