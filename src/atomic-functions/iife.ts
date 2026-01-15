import { throwTypeError } from '@/private/throw-error';
import { isFunction } from './verify';

/**
 * 立即执行函数
 *
 * @platform web, node, webworker
 *
 * @param cb 回调函数
 */
export function iife<R>(cb: () => R): R {
  if (!isFunction(cb)) {
    throwTypeError('callback is not a function');
  }
  return cb();
}
