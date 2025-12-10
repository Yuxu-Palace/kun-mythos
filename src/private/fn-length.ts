import { isFunction, isNaN, isNumber } from '@/atomic-functions/verify';
import type { KAnyFunc } from '@/types/base';
import { throwTypeError } from './throw-error';

const K_LENGTH = Symbol('kLength');

export function getFuncLength(func: KAnyFunc): number {
  if (!isFunction(func)) {
    return 0;
  }
  // @ts-expect-error 自定义属性
  return func[K_LENGTH] || func.length || 0;
}

export function setFuncLength(func: KAnyFunc, length: number) {
  if (!(isFunction(func) && isNumber(length))) {
    return;
  }
  if (isNaN(length) || length < 0) {
    throwTypeError('length must be a non-negative number');
  }
  Reflect.defineProperty(func, 'klength', {
    get: () => getFuncLength(func),
    enumerable: false,
  });
  // @ts-expect-error 自定义属性
  func[K_LENGTH] = length;
}

export function syncFuncLength(target: KAnyFunc, source: KAnyFunc) {
  if (!(isFunction(target) && isFunction(source))) {
    return;
  }
  setFuncLength(target, getFuncLength(source));
}
