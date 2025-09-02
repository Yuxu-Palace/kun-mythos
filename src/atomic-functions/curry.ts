import type { KAnyFunc, KCast, KDropHead, KLength } from '@/types/base';
import { getFuncLength, setFuncLength } from './private/fn-length';
import { isFunction } from './verify';

type KCurry<P extends any[], R> = <T extends any[]>(
  ...args: KCast<T, Partial<P>>
) => KDropHead<KLength<T>, P> extends [any, ...any[]] ? KCurry<KCast<KDropHead<KLength<T>, P>, any[]>, R> : R;

type KCurryFunc = <P extends any[], R>(fn: (...args: P) => R) => KCurry<Required<P>, R>;

export type KCurryFuncReturnType<F> = F extends KCurry<any, infer R> ? R : F extends KAnyFunc ? ReturnType<F> : F;

/**
 * 函数柯里化
 *
 * @platform web, node, webworker
 *
 * @warn 无法读取函数参数列表的长度, 不能使用参数默认值和剩余参数
 * @warn 参数默认值会导致形参列表长度读取错误!!! ```curry((a = 1) => {})``` // 不允许!!!
 * @important 重要：使用参数默认值会导致柯里化失败
 * @warn 可选参数会被强制必填
 * @warn 空参函数无需柯里化
 */
export const curry: KCurryFunc = (func) => {
  if (!isFunction(func)) {
    throw new TypeError('curry 函数的参数必须是函数');
  }
  const length = getFuncLength(func);
  if (!length) {
    throw new TypeError('无法读取函数参数列表的长度。请确保: 1) 不使用参数默认值 2) 不使用剩余参数 3) 函数有参数');
  }
  const curried = function (this: any, ...args: any) {
    if (args.length >= length) {
      return func.call(this, ...args);
    }
    const tempFunc = (...args2: any) => curried.call(this, ...args.concat(args2));
    setFuncLength(tempFunc, length - args.length);
    return tempFunc;
  };
  setFuncLength(curried, length);
  return curried as any;
};
