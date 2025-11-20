import { isArray, isObject, isPlainObject, isString, isUndef } from '../atomic-functions/verify';

export function parseSourceWithKeyPath(keyPath: string, obj: Record<PropertyKey, any>) {
  const keys = keyPath.split('.');

  const target = keys.pop();
  if (!target) {
    throw new TypeError(`keyPath is not a valid key path: ${keyPath}`);
  }

  let current = obj;
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    current = current[key];
    if (isUndef(current)) {
      break;
    }
  }

  return [current, target, (current || {})[target]];
}

export function setTarget(keyPath: string, obj: Record<PropertyKey, any>, value: any) {
  const keys = keyPath.split('.');
  // biome-ignore lint/style/noNonNullAssertion: 此处的报错已被其他逻辑前置处理, 未对用户导出, 忽略该问题
  const target = keys.pop()!;

  let current = obj;
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    if (key in current) {
      current = current[key];
      if (!isObject(current)) {
        throw new TypeError(`keyPath is not a valid key path: ${keyPath}`);
      }
    } else {
      current[key] = {};
      current = current[key];
    }
  }

  current[target] = value;
}

function resolvePath(sourcePath: string, targetPath: string) {
  if (targetPath[0] !== '.') {
    return targetPath;
  }
  const list = sourcePath.split('.');
  // biome-ignore lint/style/noNonNullAssertion: 已经前置判断所以可以忽略为空的可能
  const propName = list.pop()!;
  list.push(targetPath.slice(1) || propName);
  return list.join('.');
}

type KeyMap = string[] | Record<string, any>;

interface PickRenameOptions {
  mode?: 'pick' | 'merge';
}

type KeySourceInfo = [string, string];

function parseArrayKeySourceInfo(keyMap: KeyMap & any[]) {
  const keyPathMap: KeySourceInfo[] = Array.from({ length: keyMap.length });
  for (let i = 0; i < keyMap.length; i++) {
    const keySource = keyMap[i];
    if (!isString(keySource)) {
      throw new TypeError(`keyMap[${i}] is not a string`);
    }
    const parts = keySource.split(':');
    if (parts.length !== 2 || !parts[0] || !parts[1]) {
      throw new TypeError(`keyMap[${i}] is not a valid key mapping: ${keySource}`);
    }
    if (parts[0][0] === '.') {
      throw new TypeError(`keyMap[${i}] is not a valid key mapping: ${keySource} ${parts[0]} starts with \`.\``);
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
      throw new TypeError(`key must be a string, got ${typeof key}`);
    }
    const val = keyMap[key];
    if (!(isString(val) && val)) {
      throw new TypeError(`keyMap[${key}] is not a non-empty string`);
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
    const [source, target] = parseSourceWithKeyPath(sourceKey, sourceObj);
    const value = (source || {})[target];
    setTarget(resolvePath(sourceKey, targetKey), result, value);
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
