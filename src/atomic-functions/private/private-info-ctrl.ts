import { isNullOrUndef } from '../verify';

const metaMap = new WeakMap();

/** 检查私有类型 */
export function checkPrivateType(v: unknown, type: PropertyKey) {
  return Boolean(getPrivateMeta(v, type));
}

/** 设置私有元数据 */
export function setPrivateMeta(v: any, type: PropertyKey, meta: Record<PropertyKey, any>) {
  const metadata = metaMap.get(v) || {};

  if (!metaMap.has(v)) {
    metaMap.set(v, metadata);
  }

  if (metadata[type]) {
    const arr = Reflect.ownKeys(meta);
    for (let i = 0; i < arr.length; ++i) {
      const key = arr[i];
      metadata[type][key] = meta[key];
    }
  } else {
    metadata[type] = meta;
  }
}

/** 获取私有元数据 */
export function getPrivateMeta(v: any, type: PropertyKey): unknown {
  if (isNullOrUndef(v)) {
    throw new TypeError('[getPrivateMeta]: v is null or undefined');
  }
  return (metaMap.get(v) || {})[type];
}
