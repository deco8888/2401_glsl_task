type SplitTextsOptions = {
    selector: string;
    className: string;
    time: number;
};

const defaults: SplitTextsOptions = {
    selector: 'data-split',
    className: 'card',
    time: 0,
};

export class SplitTexts {
    private params: SplitTextsOptions;
    private elms: {
        targets: NodeListOf<HTMLElement>;
    };
    private class: {
        previous: string;
        current: string;
    };
    private container: string[];
    private time: number;
    private each: number;
    private isCharFlg: boolean;

    constructor(props: Partial<SplitTextsOptions> = {}) {
        this.params = { ...defaults, ...props };
        this.container = [];
        this.time = 1;
        this.elms = {
            targets: document.querySelectorAll(`[${this.params.selector}]`),
        };
        this.class = {
            previous: '',
            current: '',
        };
        this.time = 0;
        this.each = 0;
        this.isCharFlg = false;

        this.init();
    }

    private init() {
        this.elms.targets.forEach((target: HTMLElement) => {
            const current = target.getAttribute(this.params.selector);
            if (current) this.class.current = current;
            const targetNodes = target.childNodes as NodeListOf<Element>;
            targetNodes.forEach((node: Element) => {
                // nodeType = 3: テキスト
                node.nodeType == 3 ? this.splitText(node) : this.container.push(node.outerHTML);
            });
            target.innerHTML = this.container.join('');
            this.container = []
            this.startAnim(target);
        });
    }

    private splitText(node: Element) {
        // テキストから不要コードを除外
        if (node.textContent) {
            // \t: タブ文字　\n: 改行文字　\r: リターン、CR　\f: 改ページ
            const texts = node.textContent.replace(/(\t|\n|\r|\f)/g, '').trim();
            texts.split('').forEach((text: string) => this.setText(text));
        }
    }

    private setText(text: string) {
        this.container.push(
            `<span class="${this.class.current}__char" data-char="${this.class.current}" data-char-word="${text}">${text}</span>`
        );
    }

    private startAnim(el: HTMLElement) {
        this.setAnim(el);
    }

    private setAnim(el: HTMLElement) {
        const currentSpans = el.querySelectorAll<HTMLElement>(
            `[data-char="${this.class.current}"]`
        )
        currentSpans.forEach((span: HTMLElement, spanIndex: number) => {
            span.style.setProperty('--char-index', `${spanIndex}`)
        })
    }
}
