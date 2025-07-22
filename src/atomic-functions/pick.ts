import type { KEqual } from '@/types/base';
import { isArray, isObject } from './verify';

export type KPick<O extends Record<string, any>, K extends (keyof O | string)[]> = KEqual<K, string[]> extends true
  ? Partial<O>
  : { [K2 in K[number]]: K2 extends keyof O ? O[K2] : undefined };

/****
 * Creates a new object containing only the specified keys from the input object.
 *
 * If a key in the `keys` array does not exist on the input object, its value in the result will be `undefined`.
 *
 * @param obj - The source object to pick properties from
 * @param keys - An array of keys to select from the source object
 * @returns A new object with only the selected key-value pairs
 */
export function pick<O extends Record<string, any>, K extends (keyof O | string)[]>(obj: O, keys: K): KPick<O, K> {
  if (!isArray(keys) || !keys.length || !isObject(obj)) return {} as KPick<O, K>;

  const result = {} as KPick<O, K>;

  for (const key of keys) {
    result[key] = obj[key];
  }

  return result;
}
