/** 格式化联合类型的展示 */
export type KPrintify<T> = {
  [K in keyof T]: T[K];
};

/** 判断两个属性全等 */
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

/** 添加类型到数组末尾 */
export type KAppend<T, A extends any[]> = [...A, T];

/** 获取数组的剩余元素类型 */
export type KTailTypes<A extends any[]> = A extends [any] ? [] : A extends [any, ...infer T] ? T : [];

/** 添加类型到数组头部 */
export type KPrepend<T, A extends any[]> = [T, ...A];

/** 获取数组的长度 */
export type KLength<T extends any[]> = T['length'];

/** 获取数组的第一个元素类型 */
export type KDropHead<N extends number, T extends any[], I extends any[] = []> = KLength<I> extends N
  ? T
  : KDropHead<N, KTailTypes<T>, KPrepend<KHeadType<T>, I>>;

/** 函数类型 */
export type KFunc<T extends any[], R = any> = (...args: T) => R;

/** 任意函数类型 */
export type KAnyFunc = KFunc<any[]>;

/** 获取数组的第一个元素类型 */
export type KHeadType<A extends any[]> = A extends [infer T, ...any[]] ? T : never;

/** 如果 x 是 y 的子类型, 返回 x, 否则返回 y */
export type KCast<X, Y> = X extends Y ? X : Y;

/** 反转数组类型 */
export type KReverse<T extends any[]> = T extends [...infer R, infer L] ? [...KReverse<R>, L] : T;

/** 过滤数组 */
export type KFilterArray<F, A extends any[]> = A extends [infer I, ...any]
  ? I extends F
    ? [I, ...KFilterArray<F, KDropHead<1, A>>]
    : KFilterArray<F, KDropHead<1, A>>
  : [];

/** 填充数组 */
export type KFillArray<L extends number, V, R extends any[] = []> = L extends KLength<R>
  ? R
  : KFillArray<L, V, KAppend<V, R>>;

/** 修订数组 */
export type KPatchArray<Arr extends any[], I extends number, V, R extends any[] = []> = Arr extends [infer A, ...any]
  ? KLength<R> extends I
    ? [...R, V, ...KDropHead<1, Arr>]
    : KPatchArray<KDropHead<1, Arr>, I, V, KAppend<A, R>>
  : R;

/** 判断数组是否包含指定值 */
export type KInclude<V, A extends any[]> = A extends [infer I, ...any]
  ? I extends V
    ? true
    : KInclude<V, KDropHead<1, A>>
  : false;
