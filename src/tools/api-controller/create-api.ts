import { isString } from '@/atomic-functions/verify';
import { request } from './request';
import type { APIConfig, APIMap, APIMapTransformMethods, APITransformMethod, DefaultAPIConfig } from './types';

export function createApiWithMap<M extends APIMap, D extends DefaultAPIConfig>(
  apiMap: M,
  defaultConfig?: D,
): APIMapTransformMethods<M, D> {
  return new Proxy(apiMap, {
    get(target, prop: string, receiver) {
      const [name, isCustom] = prop.split('Custom');
      const api = Reflect.get(target, name, receiver) || {};
      if (!isString(api.url)) {
        return createApiWithMap(api as Record<string, APIConfig>, defaultConfig);
      }
      return createApi(api as APIConfig, defaultConfig, isString(isCustom));
    },
  }) as any;
}

export function createApi<
  A extends APIConfig,
  D extends DefaultAPIConfig = DefaultAPIConfig,
  C extends boolean = false,
>(api: A, defaultConfig?: D, custom?: C): APITransformMethod<A, D, C> {
  if (!isString(api.url)) {
    throw new TypeError('入参应为 APIConfig 对象');
  }
  if (custom) {
    return ((data, config) => request({ ...defaultConfig, ...api, ...config, data })) as APITransformMethod<A, D, true>;
  }
  return ((data) => request({ ...defaultConfig, ...api, data })) as APITransformMethod<A, D, C>;
}

export function defineApi<A extends APIConfig>(_api: A): A {
  return _api;
}

export function defineApiMap<A extends APIMap>(_apiMap: A): A {
  return _apiMap;
}
