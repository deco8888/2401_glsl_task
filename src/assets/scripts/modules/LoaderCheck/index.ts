export class LoaderCheck {
    private items: string[];
    private loaded: string[];

    constructor() {
        this.items = [];
        this.loaded = [];
    }

    public begin(name: string): void {
        this.items.push(name);
    }

    public end(name: string): void {
        this.loaded.push(name);
        if (this.loaded.length === this.items.length) {
            this.onComplete();
        }
    }

    public onComplete(): void {
        console.log('load complete');
    }
}
