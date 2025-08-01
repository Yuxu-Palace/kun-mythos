import type { KAnyFunc } from '@/types/base';
import { isFunction } from '../verify';

export function getFuncLength(func: KAnyFunc): number {
  if (!isFunction(func)) return 0;
  // @ts-expect-error 自定义属性
  return func.klength || func.length || 0;
}

export function setFuncLength(func: KAnyFunc, length: number) {
  if (!isFunction(func)) return;
  // @ts-expect-error 自定义属性
  func.klength = length;
}

export function syncFuncLength(target: KAnyFunc, source: KAnyFunc) {
  if (!isFunction(target) || !isFunction(source)) return;
  setFuncLength(target, getFuncLength(source));
}
