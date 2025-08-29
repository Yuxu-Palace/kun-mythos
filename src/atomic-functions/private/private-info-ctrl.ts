import { isNullOrUndef } from '../verify';

const MetaMap = new WeakMap();

/** 检查私有类型 */
export function checkPrivateType(_v: unknown, type: PropertyKey) {
  return Boolean(getPrivateMeta(_v, type));
}

/** 设置私有元数据 */
export function setPrivateMeta(_v: any, type: PropertyKey, meta: Record<PropertyKey, any>) {
  const metadata = MetaMap.get(_v) || {};

  if (!MetaMap.has(_v)) {
    MetaMap.set(_v, metadata);
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
export function getPrivateMeta(_v: any, type: PropertyKey): unknown {
  if (isNullOrUndef(_v)) {
    throw new TypeError('[getPrivateMeta]: v is null or undefined');
  }
  return (MetaMap.get(_v) || {})[type];
}
