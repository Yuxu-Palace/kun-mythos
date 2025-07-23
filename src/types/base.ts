/**
 * 格式化联合类型的展示
 */
export type KPrintify<T> = {
  [K in keyof T]: T[K];
};

/**
 * 判断两个属性全等
 */
// biome-ignore format: 保留括号更方便阅读
export type KEqual<A, B> = (<T>() => T extends A ? 1 : 2) extends (<T>() => T extends B ? 1 : 2) ? true : false;

/**
 * 生成字符串所有可能的大小写组合
 *
 * @warn 对于长字符串可能导致类型计算性能问题
 */
export type KUnULCase<T extends string> = T extends `${infer F}${infer R}`
  ? `${Uppercase<F> | Lowercase<F>}${KUnULCase<R>}`
  : Uppercase<T> | Lowercase<T>;
