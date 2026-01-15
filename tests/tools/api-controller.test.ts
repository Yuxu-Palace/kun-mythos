import { HttpResponse, http } from 'msw';
import { setupServer } from 'msw/node';
import { afterAll, afterEach, beforeAll, expect, test } from 'vitest';
import type { KEqual } from '../../src';
import { MFT } from '../utils';

const server = setupServer(
  http.get('https://api.example.com/user', (req) => {
    const url = new URL(req.request.url);
    return HttpResponse.json({ id: url.searchParams.get('id'), name: 'John Doe' });
  }),
  http.get('https://api.example.com/user/:id', (req) => {
    const { id } = req.params;
    return HttpResponse.json({ id, name: 'John Doe' });
  }),
  http.get('https://api.example.com/api/user/:id/custom-name/:name', (req) => {
    const { id, name } = req.params;
    return HttpResponse.json({ id, name });
  }),
  http.post('https://api.example.com/user', async (req) => {
    const { id } = (await req.request.json()) as { id: string };
    return HttpResponse.json({ id, name: 'John Doe' });
  }),
  http.get('https://api.example.com/user/list', () => HttpResponse.json([{ id: '1', name: 'John Doe' }])),
);

beforeAll(() => {
  server.listen({ onUnhandledRequest: 'error' });
});

afterAll(() => {
  server.close();
});

afterEach(() => {
  server.resetHandlers();
});

MFT(({ request, createApiWithMap, createApi, defineApiMap, defineApi }) => {
  test('导出测试', () => {
    expect(request).toBeTypeOf('function');
    expect(createApiWithMap).toBeTypeOf('function');
    expect(createApi).toBeTypeOf('function');
    expect(defineApiMap).toBeTypeOf('function');
    expect(defineApi).toBeTypeOf('function');
  });

  const getUserInfoApiConfig = defineApi({
    url: '/user',
    tdto(data: { id: string; name?: string }) {
      return data;
    },
    onRequest(_, config) {
      const { data } = config;
      return { id: ((data || {}).id as string) || '', name: 'John Doe' } as const;
    },
    tvo(data) {
      if (typeof data === 'string') {
        return data;
      }
      return { ...data, age: 18 } as { id: string; name: string; age: number };
    },
  });

  const mockApiMapConfig = defineApiMap({
    user: {
      getInfo: getUserInfoApiConfig,
      getList: {
        url: '/user/list',
        onResponse() {
          return [{ id: '1', name: 'John Doe' }];
        },
      },
    },
    normal: {
      url: '/normal',
    },
  });

  const mockApi = createApiWithMap(mockApiMapConfig, { baseUrl: 'https://api.example.com', requestMode: 'mock' });

  const getUserInfoApi = createApi(getUserInfoApiConfig, { baseUrl: 'https://api.example.com' });
  const getUserInfoApiCustom = createApi(getUserInfoApiConfig, { baseUrl: 'https://api.example.com' }, true);

  test('mock request', async () => {
    const res1 = await mockApi.user.getInfo({ id: '1' });
    expect(res1).toEqual({ id: '1', name: 'John Doe', age: 18 });

    const res2 = await getUserInfoApi({ id: '2' });
    expect(res2).toEqual({ id: '2', name: 'John Doe', age: 18 });

    const res3 = await getUserInfoApiCustom(
      { id: '3' },
      {
        tvo(data) {
          return { ...data, age: 19 } as { id: string; name: string; age: 19 };
        },
      },
    );
    expect(res3).toEqual({ id: '3', name: 'John Doe', age: 19 });

    // @ts-expect-error test
    expect(mockApi.aaa).toBeUndefined();

    const resList = await mockApi.user.getList();
    expect(resList).toEqual([{ id: '1', name: 'John Doe' }]);

    const resCustom = await mockApi.user.getInfoCustom(
      { id: '4' },
      {
        tvo: (data) => ({ ...data, age: 19 }) as { id: string; name: string; age: 19 },
      },
    );
    expect(resCustom).toEqual({ id: '4', name: 'John Doe', age: 19 });

    const resStream = await mockApi.user.getListCustom(void 0, {
      requestMode: 'network',
      parser: 'stream',
      onResponse: null,
    });
    expect(resStream).toBeInstanceOf(ReadableStream);

    const resNormal = await mockApi.normalCustom({}, { parser: 'stream' });
    expect(resNormal).toBeNull();

    const resText = await mockApi.user.getInfoCustom({ id: '5' }, { parser: 'text' });
    expect(resText).toBe('{"id":"5","name":"John Doe"}');

    const resTdto = await createApi(
      defineApi({
        url: '/test',
        tdto: (data: { id: string }) => {
          return { id: Number(data.id) };
        },
        onRequest(req) {
          return req.json() as unknown as { id: number };
        },
      }),
      { baseUrl: 'https://api.example.com', method: 'POST', requestMode: 'mock' },
    )({ id: '1' });
    expect(resTdto).toEqual({ id: 1 });

    await expect(
      mockApi.user.getInfoCustom(
        // @ts-expect-error test
        () => void 0,
        { method: 'POST', onRequest: null, onResponse: null, tvo: null },
      ),
    ).rejects.toThrowError();

    const resInputStr = await mockApi.user.getInfoCustom(
      // @ts-expect-error test
      JSON.stringify({ id: '10' }),
      { method: 'POST', requestMode: 'network', onRequest: null, onResponse: null, tvo: null },
    );
    expect(resInputStr).toEqual({ id: '10', name: 'John Doe' });

    const emptyUrlRes = await createApi(
      { url: '' },
      { baseUrl: 'https://api.example.com', requestMode: 'mock', tvo: () => 1, parser: 'stream' },
    )();
    expect(emptyUrlRes).toBe(1);

    await expect(
      createApi({ url: '' }, { requestMode: 'mock', tvo: () => 1, parser: 'stream' })(),
    ).rejects.toThrowError();

    await expect(
      createApi(
        { url: '' },
        { baseUrl: 'https://api.example.com', requestMode: 'mock', tvo: () => 1, parser: 'ccc' },
      )(),
    ).rejects.toThrowError();
  });

  const customApi = createApiWithMap(
    defineApiMap({
      user: {
        getInfo: getUserInfoApiConfig,
        getList: {
          url: '/user/list',
          onResponse() {
            return [{ id: '1', name: 'John Doe' }];
          },
        },
      },
    }),
    {
      baseUrl: 'https://api.example.com',
      requestMode: 'test',
      requestModeMap: {
        test: (config) => {
          const { data } = config;
          return { isTestRequest: true, ...(data || {}) } as Record<'isTestRequest' | (string & {}), any>;
        },
      },
    },
  );

  test('custom request', async () => {
    const res1 = await customApi.user.getInfo({ id: '1' });
    expect(res1).toEqual({ isTestRequest: true, id: '1' });

    const res2 = await customApi.user.getInfoCustom({ id: '1' }, { requestMode: 'network' });
    expect(res2).toEqual({ id: '1', name: 'John Doe', age: 18 });
  });

  test('create api error', () => {
    expect(() => createApi({} as any)).toThrowError(TypeError);
  });

  test('param url', async () => {
    // 输出 warn
    expect(() => createApi({ url: '/user/:id' })).toThrowError(TypeError);
    const paramApi = createApi(defineApi({ url: 'https://api.example.com/user/:id' }), {}, true);

    // @ts-expect-error test
    expect(() => paramApi(null)).toThrowError(TypeError);

    expect(await paramApi(null, { params: { id: '1' } })).toEqual({ id: '1', name: 'John Doe' });

    const paramsApi = createApi(defineApi({ url: 'https://api.example.com/api/user/:id/custom-name/:name' }), {}, true);

    // @ts-expect-error test
    expect(() => paramsApi(null, { params: { id: '1' } })).toThrowError(TypeError);
    expect(await paramsApi(null, { params: { id: '1', name: 'test' } })).toEqual({ id: '1', name: 'test' });

    const paramApiMap = createApiWithMap(
      defineApiMap({
        user: { getInfo: { url: '/user/:id' } },
        getCustomNameUser: { url: '/api/user/:id/custom-name/:name' },
      }),
      { baseUrl: 'https://api.example.com' },
    );

    // @ts-expect-error test
    expect(() => paramApiMap.user.getInfo).toThrowError(TypeError);
    expect(await paramApiMap.user.getInfoCustom(null, { params: { id: '1' } })).toEqual({ id: '1', name: 'John Doe' });
    // @ts-expect-error test
    expect(() => paramApiMap.user.getInfoCustom(null, { params: {} })).toThrowError(TypeError);
    // @ts-expect-error test
    expect(() => paramApiMap.getCustomNameUser).toThrowError(TypeError);
    expect(await paramApiMap.getCustomNameUserCustom(null, { params: { id: '1', name: 'test' } })).toEqual({
      id: '1',
      name: 'test',
    });
    // @ts-expect-error test
    expect(() => paramApiMap.getCustomNameUserCustom(null, { params: { id: 1 } })).toThrowError(TypeError);
  });

  test('proxy cache', () => {
    expect(mockApi.user.getInfo).toBe(mockApi.user.getInfo);
    expect(mockApi.user.getInfo).toBe(mockApi.user.getInfo);
    expect(mockApi.user.getInfoCustom).toBe(mockApi.user.getInfoCustom);
    expect(mockApi.user.getList).toBe(mockApi.user.getList);
  });

  test('from $ property get api config', async () => {
    expect(mockApi.user.getInfo.$).toStrictEqual(getUserInfoApi.$);
    expect(mockApi.user.getInfo.$).toStrictEqual(getUserInfoApiConfig);
    expect(mockApi.user.getInfoCustom.$).toStrictEqual(getUserInfoApiConfig);

    expect(mockApi.$).toStrictEqual(mockApiMapConfig);
    expect(mockApi.user.$).toStrictEqual(mockApiMapConfig.user);
    expect(mockApi.$.user).toStrictEqual(mockApiMapConfig.user);

    const from$api = createApi(mockApi.user.getInfo.$, { baseUrl: 'https://api.example.com' });
    expect(await from$api({ id: '1' })).toEqual({ id: '1', name: 'John Doe', age: 18 });

    const from$userApiMap = createApiWithMap(mockApi.user.$, { baseUrl: 'https://api.example.com' });
    expect(await from$userApiMap.getInfo({ id: '1' })).toEqual({ id: '1', name: 'John Doe', age: 18 });
  });

  test('from $$ property get default config', async () => {
    expect(mockApi.user.getInfo.$$).toStrictEqual(mockApi.user.getInfo.$$);
    expect(mockApi.user.getInfo.$$).toEqual({ baseUrl: 'https://api.example.com', requestMode: 'mock' });
    expect(mockApi.$$).toStrictEqual(mockApi.user.$$);
    expect(mockApi.$$).toStrictEqual(mockApi.user.getInfo.$$);

    const from$apiAnd$$defaultFormMap = createApi(mockApi.user.getInfo.$, mockApi.$$);
    expect(await from$apiAnd$$defaultFormMap({ id: '1' })).toEqual({ id: '1', name: 'John Doe', age: 18 });

    const from$apiAnd$$defaultFromApi = createApi(mockApi.user.getInfo.$, getUserInfoApi.$$);
    expect(await from$apiAnd$$defaultFromApi({ id: '1' })).toEqual({ id: '1', name: 'John Doe', age: 18 });
  });

  test('updateBaseUrl', async () => {
    const { ...mockDefaultConfig } = mockApi.$$;

    const updateApiMap = createApiWithMap(mockApi.user.$, mockDefaultConfig);
    expect(updateApiMap.$$).toStrictEqual(updateApiMap.$$r);
    expect(updateApiMap.$$).toStrictEqual(mockDefaultConfig);
    expect(updateApiMap.$$.baseUrl).toBe('https://api.example.com');
    updateApiMap.$updateBaseUrl('https://api.example.com/api');
    expect(updateApiMap.$$.baseUrl).toBe('https://api.example.com/api');

    const updateApi = createApi(
      defineApi({ ...mockApi.user.getInfo.$, url: '/user/:id/custom-name/:name', tdto: null }),
      void 0,
      true,
    );
    updateApi.$updateBaseUrl('https://api.example.com/api');
    expect(updateApi.$$).toBeUndefined();
    expect(updateApi.$$).not.toBe(updateApi.$$r);
    expect(updateApi.$$r.baseUrl).toBe('https://api.example.com/api');
    expect(await updateApi(null, { params: { id: '1', name: 'test' } })).toEqual({ id: '1', name: 'test', age: 18 });

    const updateApiMapNotDefault = createApiWithMap(mockApi.user.$);
    updateApiMapNotDefault.$updateBaseUrl('https://api.example.com/api');
    expect(updateApiMapNotDefault.$$).toBeUndefined();
    expect(updateApiMapNotDefault.$$).not.toBe(updateApiMapNotDefault.$$r);
    expect(updateApiMapNotDefault.$$r.baseUrl).toBe('https://api.example.com/api');
  });

  test('processJson', async () => {
    type RecordDeepKeyFlat<M extends Record<string, any>, Prefix extends string = ''> =
      | (M extends Record<infer KS, any>
          ? KS extends string
            ? KEqual<M[KS], any> extends true
              ? any
              : M[KS] extends Record<any, any>
                ?
                    | RecordDeepKeyFlat<M[KS], `${Prefix extends '' ? Prefix : `${Prefix}.`}${KS & string}`>
                    | `${Prefix extends '' ? Prefix : `${Prefix}.`}${KS & string}`
                : `${Prefix extends '' ? Prefix : `${Prefix}.`}${KS & string}`
            : never
          : never)
      | (string & {});

    type RecordDeepProp<K extends string, M extends Record<string, any>> = K extends `${infer P}.${infer L}`
      ? M[P] extends Record<string, any>
        ? RecordDeepProp<L, M[P]>
        : M[P]
      : K extends `${infer P}`
        ? M[P]
        : unknown;

    type ProcessJson<M> = M extends Record<infer KS, any> ? { [K in KS]: ProcessJson<M[K]> } : Promise<M>;

    type ProcessResult<M extends Record<string, any> = Record<string, any>> = {
      get(): Promise<ProcessJson<M>>;
      get<K extends RecordDeepKeyFlat<M>>(key: K): ProcessJson<RecordDeepProp<K, M>>;
      waitAll(): Promise<M>;
    };

    const processApi = createApiWithMap(
      defineApiMap({
        user: {
          getInfo: {
            url: '/user',
          },
        },
      }),
      {
        baseUrl: 'https://api.example.com',
        requestMode: 'processJson',
        requestModeMap: {
          processJson: (aaa) =>
            ({
              aaa,
              get: async (prop?: string) => {
                if (prop) {
                  return Promise.resolve('processJson') as any;
                }
                return { name: Promise.resolve('processJson') };
              },
              waitAll: async () => Promise.resolve({ name: 'processJson' }),
            }) as ProcessResult,
        },
      },
    );

    expect(await processApi.user.getInfo().waitAll()).toEqual({
      name: 'processJson',
    });
    expect(await processApi.user.getInfo().get('name')).toEqual('processJson');
    // 使用自定义请求方式时会直接绕过默认 hook
    expect(
      await processApi.user
        .getInfoCustom(null, {
          tvo() {
            throw new Error('test');
          },
        })
        .get('name'),
    ).toEqual('processJson');
  });
});
