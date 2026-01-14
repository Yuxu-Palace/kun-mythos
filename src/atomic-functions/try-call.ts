import { throwTypeError } from '@/private/throw-error';
import type { Empty } from '@/private/types';
import type { KEqual } from '@/types/base';
import { isFunction, isPromise } from './verify';

type TryCallResult<R, E> = KEqual<E, Empty> extends true ? (R extends Promise<any> ? Promise<Awaited<R>> : R) : R | E;

/**
 * 包装一个拦截错误的函数
 *
 * @platform web, node, webworker
 *
 * @param cb 回调函数
 * @param onError 错误处理函数
 */
export function tryCallFunc<A extends any[], R, E = Empty>(
  cb: (...args: A) => R,
  onError?: ((err: any) => E) | null,
  onFinal?: (result: TryCallResult<R, E>) => void,
): (...args: A) => TryCallResult<R, E> {
  if (!isFunction(cb)) {
    throwTypeError('callback is not a function');
  }

  let result = void 0 as TryCallResult<R, E>;

  const tryFn = function (this: any, args: A) {
    result = Reflect.apply(cb, this, args) as any;
    if (isPromise(result) && isFunction(onError)) {
      result = result.catch(onError) as any;
    }
  };

  const catchFn = (error: any) => {
    // biome-ignore lint/style/noNonNullAssertion: 已前置校验
    result = onError!(error) as any;
  };

  const finallyFn = () => {
    // biome-ignore lint/style/noNonNullAssertion: 已前置校验
    onFinal!(result);
  };

  if (isFunction(onFinal) && isFunction(onError)) {
    return function (this: any, ...args) {
      try {
        Reflect.apply(tryFn, this, [args]);
      } catch (e) {
        catchFn(e);
      } finally {
        finallyFn();
      }
      return result;
    };
  }

  if (isFunction(onError)) {
    return function (this: any, ...args) {
      try {
        Reflect.apply(tryFn, this, [args]);
      } catch (e) {
        catchFn(e);
      }
      return result;
    };
  }

  if (isFunction(onFinal)) {
    return function (this: any, ...args) {
      try {
        Reflect.apply(tryFn, this, [args]);
      } finally {
        finallyFn();
      }
      return result;
    };
  }

  return function (this: any, ...args) {
    Reflect.apply(tryFn, this, [args]);
    return result;
  };
}

/**
 * 尝试调用函数
 *
 * @platform web, node, webworker
 *
 * @param cb 回调函数
 * @param onError 错误处理函数
 */
export function tryCall<R, E = Empty>(
  this: any,
  cb: () => R,
  onError?: ((err: any) => E) | null,
  onFinal?: (result: TryCallResult<R, E>) => void,
): TryCallResult<R, E> {
  if (!isFunction(cb)) {
    throwTypeError('callback is not a function');
  }

  return tryCallFunc(cb, onError, onFinal).call(this);
}
