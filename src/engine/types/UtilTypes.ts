export type DeepPartial<T> = {
    [P in keyof T]?: DeepPartial<T[P]>;
};

type Without<T, K> = {
    [L in Exclude<keyof T, K>]: T[L];
};
