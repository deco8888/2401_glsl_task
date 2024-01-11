// 線形補間 (previous, current, amt)
// amt : 2つの間で保管する量（0.0から1.0）
// const lerp = (previous: number, current: number, amt: number): number => (1 - amt) * previous + amt * current;
// export { lerp };

export const lerp = (current: number, target: number, speed = 0.1, limit = 0.001) => {
    let change = (target - current) * speed;
    if (Math.abs(change) < limit) {
        change = target - current;
    }
    return change;
};
