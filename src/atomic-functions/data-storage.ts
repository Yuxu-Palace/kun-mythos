import { isObject, isPlainSymbol, isPropertyKey } from './verify';

const dataMap = new WeakMap<WeakKey, any>();
const privateDataMap = new WeakMap<WeakKey, any>();

/**
 * 存储数据
 *
 * @param key 存储的键
 * @param value 存储的值
 * @param privateKey 私有键
 */
function setData<T>(key: WeakKey, value: T, privateKey?: PropertyKey): () => T | undefined {
  if (!isPlainSymbol(key) && !isObject(key)) {
    throw new TypeError('key must be an object');
  }

  if (isPropertyKey(privateKey)) {
    const privateData = privateDataMap.get(key) || {};
    privateData[privateKey] = value;
    privateDataMap.set(key, privateData);
  } else {
    dataMap.set(key, value);
  }

  return getData.bind(null, key, privateKey) as any;
}

/**
 * 获取数据
 *
 * @param key 存储的键
 * @param privateKey 私有键
 */
function getData<T>(key: WeakKey, privateKey?: PropertyKey): T | undefined {
  if (isPropertyKey(privateKey)) {
    const privateData = privateDataMap.get(key) || {};
    return privateData[privateKey];
  }
  return dataMap.get(key);
}

export const storage = {
  set: setData,
  get: getData,
};
