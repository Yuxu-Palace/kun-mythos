import type { KAnyFunc } from '@/types/base';
import { isFunction, isObject } from './verify';

/**
 * 自动绑定对象方法的 this
 *
 * @param obj 待处理的对象
 * @param deep 是否递归处理
 */
export function autoBindFnThis<T extends Record<PropertyKey, any>>(obj: T, deep = false): T {
  return new Proxy(obj, {
    get(target, p, receiver) {
      const value = Reflect.get(target, p, receiver);

      if (isFunction(value)) {
        return (value as KAnyFunc).bind(target);
      }

      if (deep && isObject(value)) {
        return autoBindFnThis(value);
      }

      return value;
    },
  });
}
