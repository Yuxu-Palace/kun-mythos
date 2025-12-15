import { syncFuncLength } from '@/private/fn-length';
import { createMetaController } from '@/private/private-info-ctrl';
import { throwTypeError } from '@/private/throw-error';
import type { KAnyFunc, KFunc } from '@/types/base';
import { isFunction } from './verify';

const SKIP_CALL_KEY = Symbol('skipFirstCall');

interface SkipFirstCallMeta {
  called: boolean;
}

const metaCtrl = createMetaController<KAnyFunc, SkipFirstCallMeta>(SKIP_CALL_KEY);

/**
 * 判断是否是跳过第一次调用的函数
 *
 * @platform web, node, webworker
 *
 * @returns
 */
export function isSkipFirstCall(func: KAnyFunc): func is KAnyFunc {
  return metaCtrl.check(func);
}

/**
 * 跳过第一次调用的函数, 后续调用的正常执行
 *
 * 通常用于 IntersectionObserver 的回调函数
 *
 * @platform web, node, webworker
 *
 * @param func 待处理的函数
 * @param firstFunc 第一次调用的回调
 */
export function skipFirstCall<T extends KAnyFunc>(func: T, firstFunc?: KFunc<[], void>): T {
  if (!isFunction(func)) {
    throwTypeError('func is not a function');
  }

  const callback = function (this: any, ...args: any[]) {
    if (!metaCtrl.get(callback).called) {
      metaCtrl.set(callback, { called: true });
      if (isFunction(firstFunc)) {
        firstFunc.apply(this);
      }
      return;
    }
    return func.apply(this, args);
  } as T;

  metaCtrl.set(callback, { called: false });
  syncFuncLength(callback, func);

  return callback;
}
