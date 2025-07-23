export type KPrintify<T> = {
  [K in keyof T]: T[K];
};

// biome-ignore format: 保留括号更方便阅读
export type KEqual<A, B> = (<T>() => T extends A ? 1 : 2) extends (<T>() => T extends B ? 1 : 2) ? true : false;

export type KUnULCase<T extends string> = T extends `${infer F}${infer R}`
  ? `${Uppercase<F> | Lowercase<F>}${KUnULCase<R>}`
  : Uppercase<T> | Lowercase<T>;
