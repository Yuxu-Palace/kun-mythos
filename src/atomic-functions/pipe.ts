import { syncFuncLength } from '@/private/fn-length';
import { throwTypeError } from '@/private/throw-error';
import type { Empty } from '@/private/types';
import type { KAnyFunc, KEqual, KFunc } from '@/types/base';
import { isFunction } from './verify';

type FnCheck<PR> = KEqual<PR, Empty> extends true ? (...args: any[]) => any : (arg: PR) => any;

type PipeArgs<F extends KAnyFunc[], PR = Empty> = F extends [
  infer F1 extends FnCheck<PR>,
  ...infer LastF extends KAnyFunc[],
]
  ? [F1, ...PipeArgs<LastF, ReturnType<F1>>]
  : F extends []
    ? KEqual<PR, Empty> extends true
      ? [KAnyFunc]
      : []
    : F extends [FnCheck<PR>]
      ? F
      : [FnCheck<PR>, ...KAnyFunc[]];

type PipeFunc<F extends KAnyFunc[]> = F extends [KFunc<infer P, infer R>]
  ? (...args: P) => R
  : F extends [infer F extends KAnyFunc, ...KAnyFunc[], infer L extends KAnyFunc]
    ? (...args: Parameters<F>) => ReturnType<L>
    : never;

/**
 * 管道函数，从左到右执行
 *
 * @platform web, node, webworker
 *
 * @param funcs 待执行的函数, 从左到右执行
 */
export function pipe<F extends KAnyFunc[]>(...funcs: PipeArgs<F>): PipeFunc<F> {
  for (let i = 0; i < funcs.length; ++i) {
    if (!isFunction(funcs[i])) {
      throwTypeError('pipe 函数的参数必须全是函数');
    }
  }

  const pipeFn = function (this: any, ...args: any) {
    let result = args;
    for (let i = 0; i < funcs.length; ++i) {
      result = [Reflect.apply(funcs[i], this, result)];
    }
    return result[0];
  } as PipeFunc<F>;

  syncFuncLength(pipeFn, funcs[0]);

  return pipeFn;
}
