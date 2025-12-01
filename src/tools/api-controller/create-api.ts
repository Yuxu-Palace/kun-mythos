import { isString, isTrue } from '@/atomic-functions/verify';
import { request } from './request';
import type { APIConfig, APIMap, APIMapTransformMethods, APITransformMethod, DefaultAPIConfig } from './types';

/**
 * 通过 API config map 创建请求对象
 *
 * @param apiMap API config map
 * @param defaultConfig 默认配置
 */
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

/**
 * 通过 API config 创建一个请求方法
 *
 * @param api API config
 * @param defaultConfig 默认配置
 * @param custom 是否为自定义请求
 */
export function createApi<
  A extends APIConfig,
  D extends DefaultAPIConfig = DefaultAPIConfig,
  C extends boolean = false,
>(api: A, defaultConfig?: D, custom?: C): APITransformMethod<A, D, C> {
  if (!isString(api.url)) {
    throw new TypeError('入参应为 APIConfig 对象');
  }
  if (isTrue(custom)) {
    return ((data, config) => request({ ...defaultConfig, ...api, ...config, data })) as APITransformMethod<A, D, true>;
  }
  return ((data) => request({ ...defaultConfig, ...api, data })) as APITransformMethod<A, D, C>;
}

/**
 * 定义 API, ts 支持, 获取更好的类型声明
 */
export function defineApi<A extends APIConfig>(_api: A): A {
  return _api;
}

/**
 * 定义 API map, ts 支持, 获取更好的类型声明
 */
export function defineApiMap<A extends APIMap>(_apiMap: A): A {
  return _apiMap;
}
