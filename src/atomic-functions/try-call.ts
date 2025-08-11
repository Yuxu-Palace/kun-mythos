import type { KEqual } from '@/types/base';
import type { Empty } from '@/types/private';
import { isFunction, isPromise } from './verify';

type TryCallResult<R, E> = KEqual<E, Empty> extends true ? (R extends Promise<any> ? R : R | undefined) : R | E;

/**
 * 尝试调用函数
 * @param cb 回调函数
 * @param onError 错误处理函数
 */
export function tryCall<R, E = Empty>(cb: () => R, onError?: (err: any) => E): TryCallResult<R, E> {
  if (!isFunction(cb)) {
    throw new TypeError('callback is not a function');
  }

  let result: TryCallResult<R, E>;

  try {
    result = cb() as any;
    if (isPromise(result) && isFunction(onError)) {
      result = result.catch(onError) as any;
    }
  } catch (e) {
    if (isFunction(onError)) {
      result = onError(e) as any;
    } else {
      throw e;
    }
  }

  return result;
}

/**
 * 包装一个拦截错误的函数
 * @param cb 回调函数
 * @param onError 错误处理函数
 */
export function tryCallFunc<A extends any[], R, E = Empty>(
  cb: (...args: A) => R,
  onError?: (err: any) => E,
): (...args: A) => TryCallResult<R, E> {
  if (!isFunction(cb)) {
    throw new TypeError('callback is not a function');
  }
  return (...args) => tryCall(() => cb(...args), onError);
}
