import { isNullOrUndef, isString, isTrue } from '@/atomic-functions/verify';
import type { KAnyFunc } from '@/types/base';
import { request } from './request';
import type {
  APIConfig,
  APIInstance,
  APIMap,
  APIMapTransformMethods,
  APITransformMethod,
  DefaultAPIConfig,
  DefineAPIConfig,
} from './types';

const FROM_DEFINE = Symbol('fromDefine');

function instanceMemberGetter(prop: string, instanceObj: Record<string, any>) {
  return instanceObj[prop];
}

function createInstance(
  apiMap: APIConfig | APIMap,
  realDefaultConfig: DefaultAPIConfig,
  defaultConfig?: DefaultAPIConfig,
) {
  return {
    $: apiMap,
    $$: defaultConfig as any,
    $$r: realDefaultConfig,
    $updateBaseUrl(baseUrl) {
      realDefaultConfig.baseUrl = baseUrl;
    },
  } satisfies APIInstance<any, any>;
}

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
  const realDefaultConfig = defaultConfig || {};

  const instanceObj = createInstance(apiMap, realDefaultConfig, defaultConfig);

  const proxy = new Proxy(apiMap, {
    get(target, prop: string, receiver) {
      const instanceValue = instanceMemberGetter(prop, instanceObj);
      if (instanceValue) {
        return instanceValue;
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
        result = createApi({ ...api, [FROM_DEFINE]: fromDefine } as unknown as APIConfig, realDefaultConfig, isCustom);
      } else {
        result = createApiWithMap(
          { ...api, [FROM_DEFINE]: fromDefine } as Record<string, APIConfig>,
          realDefaultConfig,
        );
      }
      proxyCache[prop] = result;
      return result;
    },
  }) as any;

  return proxy;
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
  const realDefaultConfig = defaultConfig || {};

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

  let handler: any = null;
  if (isTrue(custom)) {
    handler = (async (data, config) =>
      request({
        ...realDefaultConfig,
        ...api,
        ...config,
        url: api.url,
        data,
        oriUrl: api.url,
      })) as KAnyFunc;
  } else {
    handler = (async (data) =>
      request({
        ...realDefaultConfig,
        ...api,
        data,
        oriUrl: api.url,
      })) as KAnyFunc;
  }

  const instanceObj = createInstance(api, realDefaultConfig, defaultConfig);

  return new Proxy(handler, {
    get(target, prop: string, receiver) {
      const instanceValue = instanceMemberGetter(prop, instanceObj);
      if (instanceValue) {
        return instanceValue;
      }
      return Reflect.get(target, prop, receiver);
    },
  });
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
