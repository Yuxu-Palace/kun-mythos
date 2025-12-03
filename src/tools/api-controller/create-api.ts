import { isNullOrUndef, isString, isTrue } from '@/atomic-functions/verify';
import type { KAnyFunc } from '@/types/base';
import { request } from './request';
import type {
  APIConfig,
  APIMap,
  APIMapTransformMethods,
  APITransformMethod,
  DefaultAPIConfig,
  DefineAPIConfig,
} from './types';

const FROM_DEFINE = Symbol('fromDefine');

/**
 * 通过 API config map 创建请求对象
 *
 * @param apiMap API config map
 * @param defaultConfig 默认配置
 */
export function createApiWithMap<M extends APIMap, D extends DefaultAPIConfig = DefaultAPIConfig>(
  apiMap: M,
  defaultConfig?: D,
): APIMapTransformMethods<M, D> {
  const fromDefine = (apiMap as any)[FROM_DEFINE];
  delete (apiMap as any)[FROM_DEFINE];
  const proxyCache: Record<string, any> = {};

  return new Proxy(apiMap, {
    get(target, prop: string, receiver) {
      if (prop === '$') {
        return apiMap;
      }
      const isCustom = isString(prop) && prop.endsWith('Custom');
      const name = isCustom ? prop.slice(0, -'Custom'.length) : prop;
      const api = Reflect.get(target, name, receiver);
      if (isNullOrUndef(api)) {
        return void 0;
      }
      if (proxyCache[prop]) {
        return proxyCache[prop];
      }
      let result: any = null;
      if (isString(api.url)) {
        result = createApi({ ...api, [FROM_DEFINE]: fromDefine } as unknown as APIConfig, defaultConfig, isCustom);
      } else {
        result = createApiWithMap({ ...api, [FROM_DEFINE]: fromDefine } as Record<string, APIConfig>, defaultConfig);
      }
      proxyCache[prop] = result;
      return result;
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
  const fromDefine = (api as any)[FROM_DEFINE];
  delete (api as any)[FROM_DEFINE];

  if (!isString(api.url)) {
    throw new TypeError('入参应为 APIConfig 对象');
  }
  if (api.url.includes('/:')) {
    if (!isTrue(fromDefine)) {
      console.warn('url 中存在 params 参数, 使用 defineApi 或 defineApiMap 定义 API 或 API map 来获取更好的类型提示');
    }
    if (!isTrue(custom)) {
      throw new TypeError('url 中存在 params 参数, 不支持普通请求, 转为自定义请求');
    }
  }
  const baseConfig = { ...defaultConfig, ...api };

  let handler: any = null;
  if (isTrue(custom)) {
    handler = (async (data, config) =>
      request({
        ...baseConfig,
        ...config,
        url: api.url,
        data,
        oriUrl: api.url,
      })) as KAnyFunc;
  } else {
    handler = (async (data) =>
      request({
        ...baseConfig,
        data,
        oriUrl: api.url,
      })) as KAnyFunc;
  }

  Reflect.defineProperty(handler, '$', {
    get: () => api,
    enumerable: false,
    configurable: false,
  });

  return handler;
}

/**
 * 定义 API, ts 支持, 获取更好的类型声明
 */
export function defineApi<U extends string, A extends DefineAPIConfig<U>>(_api: A): A {
  return { ..._api, [FROM_DEFINE]: true };
}

/**
 * 定义 API map, ts 支持, 获取更好的类型声明
 */
export function defineApiMap<U extends string, A extends APIMap<U>>(_apiMap: A): A {
  return { ..._apiMap, [FROM_DEFINE]: true };
}
