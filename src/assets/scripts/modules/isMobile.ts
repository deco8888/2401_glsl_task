export const breakPointOfMobile = 768;
export const isMobile = (): boolean => window.matchMedia(`(max-width: ${breakPointOfMobile}px)`).matches;
