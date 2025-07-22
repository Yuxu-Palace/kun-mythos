import { isObject, isPlainSymbol, isPropertyKey } from './verify';

const dataMap = new WeakMap<WeakKey, any>();
const privateDataMap = new WeakMap<WeakKey, any>();

/**
 * Stores a value associated with a given object or symbol key, optionally under a private property key.
 *
 * If a private key is provided, the value is stored in a nested object under the main key; otherwise, it is stored directly under the key.
 * Throws a `TypeError` if the key is not an object or a plain symbol.
 *
 * @param key - The object or plain symbol to associate the value with
 * @param value - The value to store
 * @param privateKey - Optional property key for private storage
 * @returns A function that retrieves the stored value for the same key and private key
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
 * Retrieves the value associated with the given key, optionally using a private property key.
 *
 * If a private key is provided, returns the value stored under that private key for the given object or symbol key.
 * Otherwise, returns the value directly associated with the key.
 *
 * @param key - The object or symbol used as the main key
 * @param privateKey - Optional property key for accessing private data
 * @returns The stored value, or `undefined` if no value is found
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
