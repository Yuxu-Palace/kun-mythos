import type { KAnyFunc, KEqual, KFunc } from '@/types/base';
import type { Empty } from '@/types/private';
import { syncFuncLength } from './private/fn-length';
import { isFunction } from './verify';

type FnCheck<PR> = KEqual<PR, Empty> extends true ? (...args: any[]) => any : (arg: PR) => any;

type ComposeArgs<F extends KAnyFunc[], PR = Empty> = F extends [
  infer F1 extends FnCheck<PR>,
  ...infer LastF extends KAnyFunc[],
]
  ? [F1, ...ComposeArgs<LastF, ReturnType<F1>>]
  : F extends []
    ? KEqual<PR, Empty> extends true
      ? [KAnyFunc]
      : []
    : F extends [FnCheck<PR>] | []
      ? F
      : [FnCheck<PR>, ...KAnyFunc[]];

type ComposeFunc<F extends KAnyFunc[]> = F extends [KFunc<infer P, infer R>]
  ? (...args: P) => R
  : F extends [infer F extends KAnyFunc, ...KAnyFunc[], infer L extends KAnyFunc]
    ? (...args: Parameters<F>) => ReturnType<L>
    : never;

/**
 * 组合函数
 *
 * @param funcs 待组合的函数
 */
export function compose<F extends KAnyFunc[]>(...funcs: ComposeArgs<F>): ComposeFunc<F> {
  for (let i = 0; i < funcs.length; ++i) {
    if (!isFunction(funcs[i])) {
      throw new TypeError('compose 函数的参数必须全是函数');
    }
  }

  const composeFn = function (this: any, ...args: any) {
    let result: any = args;
    for (let i = 0; i < funcs.length; ++i) {
      result = [Reflect.apply(funcs[i], this, result)];
    }
    return result[0];
  } as ComposeFunc<F>;

  syncFuncLength(composeFn, funcs[0]);

  return composeFn;
}
