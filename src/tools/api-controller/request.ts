import { getType } from '@/atomic-functions/get-type';
import { tryCall } from '@/atomic-functions/try-call';
import { isFunction, isNullOrUndef } from '@/atomic-functions/verify';
import type { APIConfig, RequestAPIConfig } from './types';

function getBody(data: any, tdto?: APIConfig['tdto']) {
  const _body = tdto ? tdto(data) : data;
  const bodyType = getType(_body);
  switch (bodyType) {
    case 'object':
    case 'array':
    case 'number':
    case 'boolean':
    case 'function':
      return JSON.stringify(_body);
    default:
      return _body;
  }
}

async function baseRequest<R, C extends RequestAPIConfig<any, R> = RequestAPIConfig<any, R>>(
  config: C,
  getResponse: (requestInfo: Request) => Promise<Response>,
): Promise<R> {
  const { baseUrl, url, method: _method, parser, data, tdto, tvo, onResponse, ...rest } = config;

  const targetUrl = new URL(url || '/', baseUrl || (globalThis.location || {}).href);
  const method = _method?.toUpperCase() as RequestInit['method'];

  const requestInfo = tryCall(() => {
    if (isNullOrUndef(method) || method === 'GET' || method === 'HEAD') {
      const queryKeys = Object.keys(data || {});
      for (let i = 0; i < queryKeys.length; ++i) {
        targetUrl.searchParams.append(queryKeys[i], (data as any)[queryKeys[i]]);
      }
      return new Request(targetUrl, { ...rest, method });
    }
    const body = getBody(data, tdto);
    return new Request(targetUrl, { ...rest, method, body });
  });

  const responseInfo = await getResponse(requestInfo);

  const resResult = await tryCall(() => {
    if (onResponse) {
      return onResponse(responseInfo, config);
    }
    if (!parser) {
      return responseInfo.json();
    }
    if (parser === 'stream') {
      return responseInfo.body;
    }
    const responseHandler = (responseInfo as unknown as Record<string, () => Promise<any>>)[parser];
    if (isFunction(responseHandler)) {
      return Reflect.apply(responseHandler, responseInfo, []);
    }
    throw new TypeError('Invalid parser');
  });

  return tvo ? tvo(resResult) : (resResult as R);
}

async function mockRequest<R, C extends RequestAPIConfig<any, R> = RequestAPIConfig<any, R>>(config: C): Promise<R> {
  const { onRequest, ...rest } = config;

  return baseRequest<R>(config, async (requestInfo) => {
    const reqResult = await (onRequest && onRequest(requestInfo, config));

    const responseBody = getBody(reqResult);
    return new Response(responseBody, { ...rest });
  });
}

async function networkRequest<R, C extends RequestAPIConfig<any, R> = RequestAPIConfig<any, R>>(config: C): Promise<R> {
  return baseRequest<R>(config, fetch);
}

/**
 * 请求方法
 *
 * @param config 请求配置
 */
export function request<R, C extends RequestAPIConfig<any, R> = RequestAPIConfig<any, R>>(config: C): Promise<R> {
  const { requestMode, requestModeMap } = config;
  const customRequest = (requestModeMap || {})[requestMode || ''];
  if (customRequest) {
    return customRequest(config);
  }
  if (requestMode === 'mock') {
    return mockRequest(config);
  }
  return networkRequest(config);
}
