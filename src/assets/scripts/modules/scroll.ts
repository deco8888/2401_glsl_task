import { addClass } from '../utils/classList';
import { hasClass } from '../utils/hasClass';

interface ScrollOptions {
    /**
     * target selector
     */
    selectors: string;
    root?: Element | Document | null;
    rootMargin?: string;
    threshold?: number | number[];
}

const defaults: ScrollOptions = {
    selectors: '[data-scroll]',
    root: null,
    rootMargin: '0px 0px -25% 0px',
    threshold: 0,
};

export class Scroll {
    params: ScrollOptions;
    targets: NodeListOf<HTMLElement> | null;
    constructor(props: Partial<ScrollOptions> = {}) {
        this.params = { ...defaults, ...props };
        this.targets = null;
        this.init();
    }
    init(): void {
        this.targets = document.querySelectorAll(this.params.selectors);
        if (this.targets.length > 0) {
            this.setScrollAnim();
        }
    }
    setScrollAnim(): void {
        const options: IntersectionObserverInit = {
            root: this.params.root,
            rootMargin: this.params.rootMargin,
            threshold: this.params.threshold,
        };
        const callback = (entries: IntersectionObserverEntry[], observer: IntersectionObserver) => {
            entries.forEach((entry: IntersectionObserverEntry) => {
                if (entry.isIntersecting) {
                    addClass(entry.target, hasClass.active);
                    observer.unobserve(entry.target);
                }
            });
        };
        const observer = new IntersectionObserver(callback, options);
        if (!this.targets) return;
        this.targets.forEach((target: HTMLElement) => {
            observer.observe(target);
        });
    }
}
