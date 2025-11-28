import { isString } from '@/atomic-functions/verify';
import { request } from './request';
import type { APIConfig, APIMap, APIMapTransformMethods, APITransformMethod } from './types';

export function createApiWithMap<M extends APIMap>(apiMap: M): APIMapTransformMethods<M> {
  return new Proxy(apiMap, {
    get(target, prop: string, receiver) {
      const api = Reflect.get(target, prop, receiver) || {};
      if (!isString(api.url)) {
        return createApiWithMap(api as Record<string, APIConfig>);
      }
      return createApi(api as APIConfig);
    },
  }) as any;
}

export function createApi<A extends APIConfig>(api: A): APITransformMethod<A> {
  if (!isString(api.url)) {
    throw new TypeError('入参应为 APIConfig 对象');
  }
  return ((data, config) => request({ ...api, ...config, data })) as APITransformMethod<A>;
}

export function defineApi<A extends APIConfig>(_api: A): A {
  return _api;
}

export function defineApiMap<A extends APIMap>(_apiMap: A): A {
  return _apiMap;
}
