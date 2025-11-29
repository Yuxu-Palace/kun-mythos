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
      return createApi({ ...defaultConfig, ...(api as APIConfig) }, !!isCustom);
    },
  }) as any;
}

export function createApi<A extends APIConfig, C extends boolean = false>(
  api: A,
  custom: C,
): APITransformMethod<A, DefaultAPIConfig, C> {
  if (!isString(api.url)) {
    throw new TypeError('入参应为 APIConfig 对象');
  }
  if (custom) {
    return ((data, config) => request({ ...api, ...config, data })) as APITransformMethod<A, DefaultAPIConfig, true>;
  }
  return ((data) => request({ ...api, data })) as APITransformMethod<A, DefaultAPIConfig, C>;
}

export function defineApi<A extends APIConfig>(_api: A): A {
  return _api;
}

export function defineApiMap<A extends APIMap>(_apiMap: A): A {
  return _apiMap;
}

const testApiMap = defineApiMap({
  user: {
    getInfo: {
      url: '',
      onResponse: () => '123',
    },
  },
  getUserInfo: {
    url: '',
    // mock: true,
    // onResponse: () => '123',
  },
});

const testApi = createApiWithMap(testApiMap, {
  onResponse: () => 123,
});

testApi.getUserInfo({});

testApi.user.getInfoCustom(
  {},
  {
    tvo: () => true,
  },
);

testApi.user.getInfoCustom({});
