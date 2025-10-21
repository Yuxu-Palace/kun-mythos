import { isArray, isDate, isObject } from './verify';

function cloneDate<T extends Date>(date: T) {
  return new Date(date.getTime()) as T;
}

function cloneObject<T extends Record<PropertyKey, any>>(obj: T, result: T, cache: WeakMap<any, any>) {
  const keys = Reflect.ownKeys(obj);

  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    // @ts-expect-error key is PropertyKey
    result[key] = _deepClone(obj[key], cache);
  }

  return result;
}

function cloneArray<T extends any[]>(arr: T, target: T, cache: WeakMap<any, any>) {
  for (let i = 0; i < arr.length; i++) {
    target[i] = _deepClone(arr[i], cache);
  }

  return target;
}

function _deepClone<T>(data: T, cache: WeakMap<any, any>): T {
  if (cache.has(data)) {
    return cache.get(data);
  }

  if (isDate(data)) {
    return cloneDate(data);
  }

  if (isObject(data)) {
    const _isArray = isArray(data);
    const result: any = _isArray ? [] : {};
    cache.set(data, result);

    if (_isArray) {
      return cloneArray(data, result, cache);
    }

    return cloneObject(data, result, cache);
  }

  return data;
}

export function deepClone<T>(data: T): T {
  return _deepClone(data, new WeakMap());
}
