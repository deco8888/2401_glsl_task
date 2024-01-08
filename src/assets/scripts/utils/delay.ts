export const delay = (ms: number): Promise<number> =>
    new Promise<number>((resolve) => setTimeout(() => resolve(ms), ms));
