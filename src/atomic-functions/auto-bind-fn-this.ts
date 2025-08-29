import type { KAnyFunc } from '@/types/base';
import { isFunction, isObject } from './verify';

/**
 * 自动绑定对象方法的 this
 *
 * @param obj 待处理的对象
 * @param deep 是否递归处理
 */
export function autoBindFnThis<T extends Record<PropertyKey, any>>(obj: T, deep = false, visited = new WeakMap()): T {
  if (visited.has(obj)) {
    return visited.get(obj);
  }

  const proxy = new Proxy(obj, {
    get(target, key, receiver) {
      const value = Reflect.get(target, key, receiver);

      if (isFunction(value)) {
        return (value as KAnyFunc).bind(target);
      }

      if (deep && isObject(value)) {
        return autoBindFnThis(value, deep, visited);
      }

      return value;
    },
  });

  visited.set(obj, proxy);
  return proxy;
}
