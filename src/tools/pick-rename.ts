import { isArray, isNumber, isObject, isPlainObject, isString, isUndef } from '@/atomic-functions/verify';
import { throwTypeError } from '@/private/throw-error';

export function parseSourceWithKeyPath(keyPath: string | PropertyKey[], obj: Record<PropertyKey, any>) {
  const oriKeys = parsePath(keyPath);
  const keys = [...oriKeys];

  const target = keys.pop();
  if (isUndef(target) || (isString(target) && !target)) {
    throwTypeError(`keyPath is not a valid key path: ${keyPath}`);
  }

  let current = obj;
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    current = current[key];
    if (isUndef(current)) {
      break;
    }
  }

  return [current, target, (current || {})[target], oriKeys] as const;
}

export function setTarget(keyPath: string | PropertyKey[], obj: Record<PropertyKey, any>, value: any) {
  const keys = parsePath(keyPath);
  // biome-ignore lint/style/noNonNullAssertion: 此处的报错已被其他逻辑前置处理, 未对用户导出, 忽略该问题
  const target = keys.pop()!;

  let current = obj;
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    if (key in current) {
      current = current[key];
      if (!isObject(current)) {
        throwTypeError(`keyPath is not a valid key path: ${keyPath}`);
      }
    } else {
      const nextKey = keys[i + 1] || target;
      current[key] = isNumber(nextKey) ? [] : {};
      current = current[key];
    }
  }

  current[target] = value;
}

function parsePath(sourcePath: string | PropertyKey[]) {
  return isArray(sourcePath) ? sourcePath : sourcePath.split('.');
}

function resolvePath(sourcePath: string | PropertyKey[], targetPath: string | PropertyKey[]) {
  if (targetPath[0] !== '.') {
    return parsePath(targetPath);
  }
  const list = parsePath(sourcePath);
  // biome-ignore lint/style/noNonNullAssertion: 已经前置判断所以可以忽略为空的可能
  const propName = list.pop()!;
  if (isArray(targetPath)) {
    const temp = targetPath.slice(1);
    list.push(...(temp.length !== 0 ? temp : [propName]));
  } else {
    list.push(targetPath.slice(1) || propName);
  }
  return list;
}

type KeyMap = string[] | Record<string, any> | KeySourceInfo[];

interface PickRenameOptions {
  mode?: 'pick' | 'merge';
}

type KeySourceInfo = [PropertyKey[] | string, PropertyKey[] | string];

function parseArrayKeySourceInfo(keyMap: KeyMap & any[]) {
  const keyPathMap: KeySourceInfo[] = Array.from({ length: keyMap.length });
  for (let i = 0; i < keyMap.length; i++) {
    const keySource = keyMap[i];
    let parts: any[];
    if (isArray(keySource) && keySource.length === 2) {
      parts = keySource as KeySourceInfo;
    } else if (isString(keySource)) {
      parts = keySource.split(':');
    } else {
      throwTypeError(`keyMap[${i}] is not a string`);
    }
    if (parts.length !== 2 || !parts[0].length || !parts[1].length) {
      throwTypeError(`keyMap[${i}] is not a valid key mapping: ${keySource}`);
    }
    if (parts[0][0] === '.') {
      throwTypeError(`keyMap[${i}] is not a valid key mapping: ${keySource} ${parts[0]} starts with \`.\``);
    }
    keyPathMap[i] = parts as KeySourceInfo;
  }
  return keyPathMap;
}

function parseObjectKeySourceInfo(keyMap: KeyMap & Record<any, any>) {
  const keys = Reflect.ownKeys(keyMap);
  const keyPathMap: KeySourceInfo[] = Array.from({ length: keys.length });

  for (let i = 0; i < keys.length; i++) {
    const key = keys[i] as string;
    if (!isString(key)) {
      throwTypeError(`key must be a string, got ${typeof key}`);
    }
    const val = keyMap[key];
    if (!(isString(val) && val)) {
      throwTypeError(`keyMap[${key}] is not a non-empty string`);
    }
    keyPathMap[i] = [key, keyMap[key]];
  }

  return keyPathMap;
}

function parseKeySourceInfo(keyMap: KeyMap) {
  if (isArray(keyMap)) {
    return parseArrayKeySourceInfo(keyMap);
  }
  if (isPlainObject(keyMap)) {
    return parseObjectKeySourceInfo(keyMap);
  }
  return [];
}

function applyKeySourceInfo<T extends Record<PropertyKey, any>>(
  keyPathMap: KeySourceInfo[],
  sourceObj: Record<PropertyKey, any>,
  result: T,
) {
  for (let i = 0; i < keyPathMap.length; i++) {
    const [sourceKey, targetKey] = keyPathMap[i];
    const [, , value, sourceKeyPath] = parseSourceWithKeyPath(sourceKey, sourceObj);
    setTarget(resolvePath(sourceKeyPath, targetKey), result, value);
  }
  return result;
}

/**
 * 挑选对象中的指定键的值组成一个新对象
 *
 * @warn merge 模式下，会直接修改 obj, 你可以选择 clone 一份再使用
 */
export function pickRename<T extends Record<PropertyKey, any> = Record<PropertyKey, any>>(
  keyMap: KeyMap,
  obj: Record<PropertyKey, any>,
  options?: PickRenameOptions,
): T {
  const { mode = 'pick' } = options || {};
  const result = (mode === 'merge' ? obj : {}) as T;
  const keyPathMap = parseKeySourceInfo(keyMap);

  return applyKeySourceInfo(keyPathMap, obj, result);
}
