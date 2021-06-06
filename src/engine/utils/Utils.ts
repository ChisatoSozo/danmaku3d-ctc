export const capFirst = (str: string) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
};

export const nextPowerOfTwo = (n: number) => {
    if (n === 0) return 1;
    n--;
    n |= n >> 1;
    n |= n >> 2;
    n |= n >> 4;
    n |= n >> 8;
    n |= n >> 16;
    return n + 1;
};
