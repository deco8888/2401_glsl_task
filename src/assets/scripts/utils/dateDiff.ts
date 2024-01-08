export const dateDiff = (date1: Date, date2: Date): number => {
    const diffTime = date1.getTime() - date2.getTime();
    const diffDate = Math.floor(diffTime / (24 * 60 * 60 * 1000));
    return diffDate;
};
