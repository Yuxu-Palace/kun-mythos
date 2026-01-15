import { syncFuncLength } from '@/private/fn-length';
import { throwTypeError } from '@/private/throw-error';
import type { Empty } from '@/private/types';
import type { KAnyFunc, KEqual, KFunc, KLength, KTailTypes } from '@/types/base';
import { isFunction } from './verify';

type FnCheck<PR> = KEqual<PR, Empty> extends true ? (...args: any[]) => any : (arg: PR) => any;

type PlaceholderFuncs<F extends number, Res extends KAnyFunc[] = []> = KLength<Res> extends F
  ? Res
  : PlaceholderFuncs<F, [...Res, KAnyFunc]>;

type ComposeArgs<F extends KAnyFunc[], PR = Empty> = F extends [FnCheck<PR>]
  ? F
  : F extends [...infer FirstF extends KAnyFunc[], infer L extends FnCheck<PR>]
    ? [...ComposeArgs<FirstF, ReturnType<L>>, L]
    : F extends []
      ? [KAnyFunc]
      : [...PlaceholderFuncs<KLength<KTailTypes<F>>>, FnCheck<PR>, ...KAnyFunc[]];

// type ComposeArgs<F extends KAnyFunc[], PR = Empty> = F extends [
//   ...infer FirstF extends KAnyFunc[],
//   infer L extends FnCheck<PR>,
// ]
//   ? [...ComposeArgs<FirstF, ReturnType<L>>, L]
//   : F extends []
//     ? KEqual<PR, Empty> extends true
//       ? [KAnyFunc]
//       : []
//     : F extends [FnCheck<PR>]
//       ? F
//       : [...PlaceholderFuncs<KLength<KTailTypes<F>>>, FnCheck<PR>, ...KAnyFunc[]];

type ComposeFunc<F extends KAnyFunc[]> = F extends [KFunc<infer P, infer R>]
  ? (...args: P) => R
  : F extends [infer F extends KAnyFunc, ...KAnyFunc[], infer L extends KAnyFunc]
    ? (...args: Parameters<L>) => ReturnType<F>
    : never;

/**
 * 组合函数, 从右到左执行
 *
 * @platform web, node, webworker
 *
 * @param funcs 待组合的函数，从右到左执行
 */
export function compose<F extends KAnyFunc[]>(...funcs: ComposeArgs<F>): ComposeFunc<F> {
  for (let i = 0; i < funcs.length; ++i) {
    if (!isFunction(funcs[i])) {
      throwTypeError('compose 函数的参数必须全是函数');
    }
  }

  const composeFn = function (this: any, ...args: any) {
    let result: any = args;
    for (let i = funcs.length - 1; i >= 0; --i) {
      result = [Reflect.apply(funcs[i], this, result)];
    }
    return result[0];
  } as ComposeFunc<F>;

  syncFuncLength(composeFn, funcs[0]);

  return composeFn;
}
