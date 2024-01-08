import { isMobile } from './isMobile';

interface SmoothScrollOptions {
    /**
     * target selector
     */
    anchorSelector: string;
}

const defaults: SmoothScrollOptions = {
    anchorSelector: '[data-anchor]',
};

export class SmoothScroll {
    params: SmoothScrollOptions;
    elms: {
        targets: NodeListOf<HTMLElement>;
        header: HTMLElement | null;
    };
    headerHeight: number;
    threshold: number;
    isMobile: boolean;
    constructor(props: Partial<SmoothScrollOptions> = {}) {
        this.params = { ...defaults, ...props };
        this.elms = {
            targets: document.querySelectorAll(this.params.anchorSelector),
            header: null,
        };
        this.headerHeight = 0;
        this.isMobile = isMobile();
        this.threshold = this.isMobile ? 50 : 100;
        if (this.elms.targets.length > 0) this.init();
    }
    init(): void {
        this.elms.targets.forEach((target) => {
            target.addEventListener('click', (): void => {
                const href = target.getAttribute('href');
                if (!href) return;
                const selector = href.substring(href.indexOf('#'), href.length);
                this.setSmoothScroll(selector);
            });
        });
    }
    setSmoothScroll(selector: string): void {
        const target = document.querySelector<HTMLElement>(selector);
        if (!target) return;
        const targetTop = target.getBoundingClientRect().top;
        const offsetTop = window.scrollY;
        // target.style.scrollMarginTop = `${this.headerHeight}px`;
        window.scrollTo({
            top: targetTop + offsetTop,
            behavior: 'smooth',
        });
    }
}
