export type DeepPartial<T> = {
    [P in keyof T]?: DeepPartial<T[P]>;
};

export type ValidateShape<T, Shape> = Exclude<keyof T, keyof Shape> extends never ? T : never;
