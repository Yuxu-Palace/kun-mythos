import { isNullOrUndef, isString, isTrue } from '@/atomic-functions/verify';
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
  return new Proxy(apiMap, {
    get(target, prop: string, receiver) {
      const isCustom = isString(prop) && prop.endsWith('Custom');
      const name = isCustom ? prop.slice(0, -'Custom'.length) : prop;
      const api = Reflect.get(target, name, receiver);
      if (isNullOrUndef(api)) {
        return void 0;
      }
      if (!isString(api.url)) {
        return createApiWithMap({ ...api, [FROM_DEFINE]: fromDefine } as Record<string, APIConfig>, defaultConfig);
      }
      return createApi({ ...api, [FROM_DEFINE]: fromDefine } as unknown as APIConfig, defaultConfig, isCustom);
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
  if (api.url.includes('/:')) {
    if (!isTrue((api as any)[FROM_DEFINE])) {
      console.warn('url 中存在 params 参数, 使用 defineApi 或 defineApiMap 定义 API 或 API map 来获取更好的类型提示');
    }
    if (!isTrue(custom)) {
      throw new TypeError('url 中存在 params 参数, 不支持普通请求, 转为自定义请求');
    }
  }
  const baseConfig = { ...defaultConfig, ...api };
  if (isTrue(custom)) {
    return (async (data, config) =>
      request({
        ...baseConfig,
        ...config,
        url: api.url,
        data,
        oriUrl: api.url,
      })) as APITransformMethod<A, D, true>;
  }
  return (async (data) =>
    request({
      ...baseConfig,
      data,
      oriUrl: api.url,
    })) as APITransformMethod<A, D, C>;
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
