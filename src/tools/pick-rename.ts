import { isArray, isObject, isString } from '../atomic-functions/verify';

function getSourceInfo(keyPath: string, obj: Record<PropertyKey, any>) {
  const keys = keyPath.split('.');
  const target = keys.pop();

  if (!target) {
    throw new TypeError(`keyPath is not a valid key path: ${keyPath}`);
  }

  let current = obj;
  for (let i = 0; i < keys.length; i++) {
    if (typeof current === 'undefined') {
      break;
    }
    current = current[keys[i]];
  }

  return [current, target] as const;
}

function setTarget(keyPath: string, obj: Record<PropertyKey, any>, value: any) {
  const keys = keyPath.split('.');
  const target = keys.pop();

  if (!target) {
    throw new TypeError(`keyPath is not a valid key path: ${keyPath}`);
  }

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
  list.pop();
  list.push(targetPath.slice(1));
  return list.join('.');
}

type KeyMap = string[] | Record<string, any>;

interface PickRenameOptions {
  mode?: 'pick' | 'merge';
}

type KeySourceInfo = [string, string];

function parseKeySourceInfo(keyMap: KeyMap) {
  const keyPathMap: KeySourceInfo[] = [];

  if (isArray(keyMap)) {
    for (let i = 0; i < keyMap.length; i++) {
      const keySource = keyMap[i];
      if (!isString(keySource)) {
        throw new TypeError(`keyMap[${i}] is not a string`);
      }
      keyPathMap.push(keySource.split(':') as KeySourceInfo);
    }
  } else if (isObject(keyMap)) {
    const keys = Object.keys(keyMap);
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      keyPathMap.push([key, keyMap[key] as string]);
    }
  }

  return keyPathMap;
}

function applyKeySourceInfo<T extends Record<PropertyKey, any>>(
  keyPathMap: KeySourceInfo[],
  sourceObj: Record<PropertyKey, any>,
  result: T,
) {
  for (let i = 0; i < keyPathMap.length; i++) {
    const [sourceKey, targetKey] = keyPathMap[i];
    const [source, target] = getSourceInfo(sourceKey, sourceObj);
    const value = (source || {})[target];
    setTarget(resolvePath(sourceKey, targetKey), result, value);
  }
  return result;
}

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
