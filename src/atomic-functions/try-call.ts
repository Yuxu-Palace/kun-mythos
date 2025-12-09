import type { KEqual } from '@/types/base';
import type { Empty } from '@/types/private';
import { isFunction, isPromise } from './verify';

type TryCallResult<R, E> = KEqual<E, Empty> extends true ? (R extends Promise<any> ? R : R | undefined) : R | E;

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
    throw new TypeError('callback is not a function');
  }

  let result = void 0 as TryCallResult<R, E>;

  const tryFn = function (this: any, args: A) {
    result = Reflect.apply(cb, this, args) as any;
    if (isPromise(result) && isFunction(onError)) {
      result = result.catch(onError) as any;
    }
  };

  const catchFn = (error: any) => {
    if (isFunction(onError)) {
      result = onError(error) as any;
    }
  };

  const finallyFn = () => {
    // biome-ignore lint/nursery/noUnusedExpressions: test
    isFunction(onFinal) && onFinal(result);
  };

  if (onFinal && onError) {
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

  if (onError) {
    return function (this: any, ...args) {
      try {
        Reflect.apply(tryFn, this, [args]);
      } catch (e) {
        catchFn(e);
      }
      return result;
    };
  }

  if (onFinal) {
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
  cb: () => R,
  onError?: ((err: any) => E) | null,
  onFinal?: (result: TryCallResult<R, E>) => void,
): TryCallResult<R, E> {
  if (!isFunction(cb)) {
    throw new TypeError('callback is not a function');
  }

  return tryCallFunc(cb, onError, onFinal)();
}
