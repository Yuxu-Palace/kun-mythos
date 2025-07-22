import type { KEqual } from '@/types/base';
import { isArray, isObject } from './verify';

export type KPick<O extends Record<string, any>, K extends (keyof O | string)[]> = KEqual<K, string[]> extends true
  ? Partial<O>
  : { [K2 in K[number]]: K2 extends keyof O ? O[K2] : undefined };

/**
 * 挑选对象中的指定键的值组成一个新对象
 */
export function pick<O extends Record<string, any>, K extends (keyof O | string)[]>(obj: O, keys: K): KPick<O, K> {
  if (!isArray(keys) || !keys.length || !isObject(obj)) return {} as KPick<O, K>;

  const result = {} as KPick<O, K>;

  for (const key of keys) {
    result[key] = obj[key];
  }

  return result;
}
