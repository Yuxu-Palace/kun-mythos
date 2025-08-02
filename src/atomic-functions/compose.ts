import type { KAnyFunc, KFunc } from '@/types/base';
import { syncFuncLength } from './private/fn-length';
import { isFunction } from './verify';

type ComposeArgs<F extends KAnyFunc[]> = unknown[];

type ComposeFunc<F extends KAnyFunc[]> = F extends [KFunc<infer P, infer R>]
  ? (...args: P) => R
  : F extends [infer F extends KAnyFunc, ...KAnyFunc[], infer L extends KAnyFunc]
    ? (...args: Parameters<L>) => ReturnType<F>
    : never;

/**
 * 组合函数, 从右到左执行
 *
 * @param funcs 待组合的函数，从右到左执行
 */
export function compose<F extends KAnyFunc[]>(...funcs: ComposeArgs<F>): ComposeFunc<F> {
  for (let i = 0; i < funcs.length; ++i) {
    if (!isFunction(funcs[i])) {
      throw new TypeError('compose 函数的参数必须全是函数');
    }
  }

  const composeFn = function (this: any, ...args: any) {
    let result: any = args;
    for (let i = funcs.length - 1; i >= 0; --i) {
      // @ts-expect-error TODO
      result = [Reflect.apply(funcs[i], this, result)];
    }
    return result[0];
  } as ComposeFunc<F>;

  // @ts-expect-error TODO
  syncFuncLength(composeFn, funcs[0]);

  return composeFn;
}
