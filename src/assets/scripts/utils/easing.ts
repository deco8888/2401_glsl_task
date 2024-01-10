export const easeOutSine = (t: number, b: number, c: number, d: number) => {
    return c * Math.sin((t / d) * (Math.PI / 2)) + b;
};

export const easeOutQuad = (t: number, b: number, c: number, d: number) => {
    t /= d;
    return -c * t * (t - 2) + b;
};
