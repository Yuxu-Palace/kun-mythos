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

function targetUrlParser(_url: string, _baseUrl: string | undefined) {
  const tempBaseUrl = _baseUrl || (globalThis.location || {}).origin;
  let url = _url;
  let baseUrl: string | URL | undefined = tempBaseUrl;
  if (tempBaseUrl) {
    baseUrl = new URL(tempBaseUrl);
    url = (baseUrl.pathname === '/' ? '' : baseUrl.pathname) + (_url[0] === '/' ? _url : `/${_url}`);
  }
  return new URL(url || '/', baseUrl);
}

async function baseRequest<R, C extends RequestAPIConfig<any, R> = RequestAPIConfig<any, R>>(
  config: C,
  getResponse: (requestInfo: Request) => Promise<Response>,
): Promise<R> {
  const { baseUrl, url, method: _method, parser, data, tdto, tvo, onResponse, ...rest } = config;

  const targetUrl = targetUrlParser(url, baseUrl);
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

function urlParamsParser(url: string, params: Record<string, string> | undefined) {
  if (!url.includes('/:')) {
    return url;
  }
  if (!params) {
    throw new TypeError('url 中存在 params 参数, params 配置不能为空, 请使用 custom 方法调用并传递 params 配置');
  }
  const urlSplit = url.split('/');
  const emptyKeys: string[] = [];
  for (let i = 1; i < urlSplit.length; ++i) {
    if (urlSplit[i][0] !== ':') {
      continue;
    }
    const param = urlSplit[i].slice(1);
    const paramValue = params[param];
    if (!paramValue) {
      emptyKeys.push(param);
      continue;
    }
    urlSplit[i] = params[param];
  }
  if (emptyKeys.length) {
    throw new TypeError(`params 配置中缺少 [${emptyKeys.join(', ')}] 参数`);
  }
  return urlSplit.join('/');
}

/**
 * 请求方法
 *
 * @param config 请求配置
 */
export function request<R, C extends RequestAPIConfig<any, R> = RequestAPIConfig<any, R>>(config: C): Promise<R> {
  const url = urlParamsParser(config.url, config.params);

  const { requestMode, requestModeMap } = config;
  const customRequest = (requestModeMap || {})[requestMode || ''];
  if (customRequest) {
    return customRequest({ ...config, url });
  }

  if (requestMode === 'mock') {
    return mockRequest({ ...config, url });
  }
  return networkRequest({ ...config, url });
}
