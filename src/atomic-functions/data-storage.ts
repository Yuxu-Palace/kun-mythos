import { isObject, isPlainSymbol, isPropertyKey } from './verify';

const DATA_MAP = new WeakMap<WeakKey, any>();
const PRIVATE_DATA_MAP = new WeakMap<WeakKey, any>();

/**
 * 存储数据
 *
 * @param key 存储的键
 * @param value 存储的值
 * @param privateKey 私有键
 */
function setData<T>(key: WeakKey, value: T, privateKey?: PropertyKey): () => T | undefined {
  if (!(isPlainSymbol(key) || isObject(key))) {
    throw new TypeError('key must be an object or plain symbol');
  }

  if (isPropertyKey(privateKey)) {
    const privateData = PRIVATE_DATA_MAP.get(key) || {};
    privateData[privateKey] = value;
    PRIVATE_DATA_MAP.set(key, privateData);
  } else {
    DATA_MAP.set(key, value);
  }

  return () => getData(key, privateKey);
}

/**
 * 获取数据
 *
 * @param key 存储的键
 * @param privateKey 私有键
 */
function getData<T>(key: WeakKey, privateKey?: PropertyKey): T | undefined {
  if (isPropertyKey(privateKey)) {
    const privateData = PRIVATE_DATA_MAP.get(key) || {};
    return privateData[privateKey];
  }
  return DATA_MAP.get(key);
}

export const storage = {
  set: setData,
  get: getData,
};
