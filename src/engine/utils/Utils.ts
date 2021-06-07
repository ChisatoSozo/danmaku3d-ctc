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

export const filterInPlace = <T>(a: T[], condition: (value: T, i: number, a: T[]) => boolean) => {
    let i = 0,
        j = 0;

    while (i < a.length) {
        const val = a[i];
        if (condition(val, i, a)) a[j++] = val;
        i++;
    }

    a.length = j;
    return a;
};
