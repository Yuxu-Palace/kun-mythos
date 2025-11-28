import { getType } from '@/atomic-functions/get-type';
import { tryCall } from '@/atomic-functions/try-call';
import type { APIConfig, RequestAPIConfig } from './types';

function getBody(data: any, tdto?: APIConfig['tdto']) {
  const _body = tdto?.(data) || data;
  return tryCall(
    () => JSON.stringify(_body),
    (err) => {
      const bodyType = getType(_body);
      switch (bodyType) {
        case 'object':
        case 'array':
        case 'function':
        case 'symbol':
          // 更多不允许的类型
          throw err;
        default:
          return _body;
      }
    },
  );
}

export async function baseRequest<R, C extends RequestAPIConfig<any, R> = RequestAPIConfig<any, R>>(
  config: C,
  getResponse: (requestInfo: Request) => Promise<Response>,
): Promise<R> {
  const { url, parser, data, tdto, tvo, onResponse, ...rest } = config;

  const body = getBody(data, tdto);
  const requestInfo = new Request(url, { ...rest, body });

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
    return responseInfo[parser]();
  });

  return tvo ? tvo(resResult) : (resResult as R);
}

export async function mockRequest<R, C extends RequestAPIConfig<any, R> = RequestAPIConfig<any, R>>(
  config: C,
): Promise<R> {
  const { onRequest, ...rest } = config;

  return baseRequest<R>(config, async (requestInfo) => {
    const reqResult = await onRequest?.(requestInfo, config);

    const responseBody = getBody(reqResult);
    return new Response(responseBody, { ...rest });
  });
}

export async function networkRequest<R, C extends RequestAPIConfig<any, R> = RequestAPIConfig<any, R>>(
  config: C,
): Promise<R> {
  return baseRequest<R>(config, fetch);
}

export function request<R, C extends RequestAPIConfig<any, R> = RequestAPIConfig<any, R>>(config: C): Promise<R> {
  const { mock } = config;
  if (mock) {
    return mockRequest(config);
  }
  return networkRequest(config);
}
