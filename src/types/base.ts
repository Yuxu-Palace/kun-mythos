export type KPrintify<T> = {
  [K in keyof T]: T[K];
};

export type KEqual<A, B> = (<T>() => T extends A ? 1 : 2) extends <T>() => T extends B ? 1 : 2 ? true : false;
