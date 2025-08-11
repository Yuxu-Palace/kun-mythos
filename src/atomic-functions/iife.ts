import { isFunction } from './verify';

/**
 * 立即执行函数
 * @param cb 回调函数
 */
export function iife<R>(cb: () => R): R {
  if (!isFunction(cb)) {
    throw new TypeError('callback is not a function');
  }
  return cb();
}
