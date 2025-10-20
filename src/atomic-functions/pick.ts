import type { KEqual } from '@/types/base';
import { isArray, isObject } from './verify';

export type KPick<O extends Record<string, any>, K extends (keyof O | string)[]> = KEqual<K, string[]> extends true
  ? Partial<O>
  : { [K2 in K[number]]: K2 extends keyof O ? O[K2] : any };

/**
 * 挑选对象中的指定键的值组成一个新对象
 *
 * @platform web, node, webworker
 */
export function pick<O extends Record<PropertyKey, any>, K extends (keyof O | PropertyKey)[]>(
  obj: O,
  keys: K,
): KPick<O, K> {
  if (!(isArray(keys) && keys.length && isObject(obj))) {
    return {} as KPick<O, K>;
  }

  const result = {} as KPick<O, K>;
  // 不用 Object.hasOwn 判断是否存在是因为他会排除 symbol 键
  const ownKeys = new Set<PropertyKey>(Reflect.ownKeys(obj));

  for (let i = 0; i < keys.length; ++i) {
    const key = keys[i];
    if (!ownKeys.has(key)) {
      continue;
    }
    result[key] = obj[key];
  }

  return result;
}
