export const isContains = (el: HTMLElement | Element, selector: string): boolean => {
    return el != null ? el.classList.contains(selector) : false;
};

export const addClass = (el: HTMLElement | Element, selector: string): void => {
    if (!isContains(el, selector)) el.classList.add(selector);
};

export const removeClass = (el: HTMLElement | Element, selector: string): void => {
    if (isContains(el, selector)) el.classList.remove(selector);
};
