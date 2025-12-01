import type { KCast, KEqual } from '@/types/base';

/** 请求方法 */
export type RequestMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD' | 'OPTIONS';

export interface BaseAPIConfig<
  Input = any,
  Output = any,
  MockReqOutput = any,
  MockResOutput = any,
  DefaultConfig extends DefaultAPIConfig = DefaultAPIConfig,
  ReqModeMapKeys extends string = string & {},
> extends RequestInit {
  /**
   * 请求地址
   *
   * @example '/api/user'
   * @example 'https://example.com/api/user'
   */
  url: string;
  /** 请求模式 */
  requestMode?: 'mock' | 'network' | ReqModeMapKeys;
  /** 请求方法 */
  method?: RequestMethod;
  /** 响应体解析方式 */
  parser?: 'json' | 'text' | 'blob' | 'arrayBuffer' | 'formData' | 'bytes' | 'stream' | (string & {});
  /** transform data transfer object */
  tdto?: (data: Input) => any;
  /** transform view object */
  tvo?: (
    data: FindNonAny<[Awaited<MockResOutput>, Awaited<ReturnType<NonNullable<DefaultConfig['onResponse']>>>]>,
  ) => Output;
  /** 请求前 hook */
  onRequest?: (
    data: Request,
    config: RequestAPIConfig<Input, Output, MockReqOutput, MockResOutput, ReqModeMapKeys>,
  ) => MockReqOutput;
  /** 响应前 hook */
  onResponse?: (
    data: Response,
    config: RequestAPIConfig<Input, Output, MockReqOutput, MockResOutput, ReqModeMapKeys>,
  ) => MockResOutput;
}

export interface DefaultAPIConfig<
  Input = any,
  Output = any,
  MockReqOutput = any,
  MockResOutput = any,
  ReqModeMapKeys extends string = string & {},
> extends Omit<BaseAPIConfig<Input, Output, MockReqOutput, MockResOutput, DefaultAPIConfig, ReqModeMapKeys>, 'url'> {
  /** 基本地址 */
  baseUrl?: string;
  /** 请求模式 map */
  requestModeMap?: Record<
    ReqModeMapKeys,
    (config: RequestAPIConfig<Input, Output, MockReqOutput, MockResOutput, ReqModeMapKeys>) => any
  >;
}

export interface RequestAPIConfig<
  Input = any,
  Output = any,
  MockReqOutput = any,
  MockResOutput = any,
  ReqModeMapKeys extends string = string & {},
> extends DefaultAPIConfig<Input, Output, MockReqOutput, MockResOutput, ReqModeMapKeys>,
    BaseAPIConfig<Input, Output, MockReqOutput, MockResOutput, DefaultAPIConfig, ReqModeMapKeys> {
  /** 请求数据 */
  data?: Input;
}

// export interface MockAPIConfig<
//   Input = any,
//   Output = any,
//   MockReqOutput = any,
//   MockResOutput = any,
//   DefaultConfig extends DefaultAPIConfig = DefaultAPIConfig,
//   ReqModeMapKeys extends string = string & {},
// > extends BaseAPIConfig<Input, Output, MockReqOutput, MockResOutput, DefaultConfig, ReqModeMapKeys> {
//   requestMode: 'mock';
// }

/**
 * API config
 */
export type APIConfig<
  Input = any,
  Output = any,
  MockReqOutput = any,
  MockResOutput = any,
  DefaultConfig extends DefaultAPIConfig = DefaultAPIConfig,
  ReqModeMapKeys extends string = string & {},
> = BaseAPIConfig<Input, Output, MockReqOutput, MockResOutput, DefaultConfig, ReqModeMapKeys>;
// | MockAPIConfig<Input, Output, MockReqOutput, MockResOutput, DefaultConfig, ReqModeMapKeys>;

/** API map */
export type APIMap = Record<string, APIConfig | Record<string, APIConfig>>;

export type IsUnknownAny<T> = KEqual<T, any> extends true ? true : KEqual<T, unknown> extends true ? true : false;

export type FindNonAny<T extends any[]> = T extends [infer F, ...infer Last]
  ? IsUnknownAny<F> extends true
    ? FindNonAny<Last>
    : F
  : any;

type ApiConfigParams<I, C, Custom> = Custom extends true ? [I?, C?] : [I?];

type DefineRequestModes<D extends DefaultAPIConfig> = D extends DefaultAPIConfig<any, any, any, any, infer Keys>
  ? Keys
  : string & {};

type PlainDefaultConfig<D extends DefaultAPIConfig> = Omit<D, 'requestMode'>;

type CustomRequestModeResult<A extends APIConfig, D extends DefaultAPIConfig> = FindNonAny<
  [A['requestMode'], D['requestMode']]
> extends infer ReqMode
  ? ReqMode extends 'mock'
    ? any
    : Awaited<ReturnType<NonNullable<NonNullable<D['requestModeMap']>[ReqMode & string]>>>
  : any;

export type APITransformMethod<
  A extends APIConfig,
  InputD extends DefaultAPIConfig = DefaultAPIConfig,
  Custom extends boolean = false,
  D extends DefaultAPIConfig = PlainDefaultConfig<InputD>,
> = A extends APIConfig<infer Input, infer Output, infer MockReqOutput, infer MockResOutput, D>
  ? FindNonAny<
      [CustomRequestModeResult<A, InputD>, Output, MockResOutput, A['requestMode'] extends 'mock' ? MockReqOutput : any]
    > extends infer Res
    ? IsUnknownAny<Res> extends true
      ? <
          R extends Output,
          I extends Input = Input,
          C extends Omit<APIConfig<I, Output, MockReqOutput, MockResOutput, D, DefineRequestModes<D>>, 'url'> = Omit<
            APIConfig<I, Output, MockReqOutput, MockResOutput, D, DefineRequestModes<D>>,
            'url'
          >,
        >(
          ...args: ApiConfigParams<I, C, Custom>
        ) => Promise<
          FindNonAny<
            [Awaited<ReturnType<NonNullable<C['tvo']>>>, Awaited<R>, Awaited<ReturnType<NonNullable<D['onResponse']>>>]
          >
        >
      : <
          I extends Input,
          R extends Res = Res,
          C extends Omit<APIConfig<I, Output, MockReqOutput, MockResOutput, D, DefineRequestModes<D>>, 'url'> = Omit<
            APIConfig<I, Output, MockReqOutput, MockResOutput, D, DefineRequestModes<D>>,
            'url'
          >,
        >(
          ...args: ApiConfigParams<I, C, Custom>
        ) => Promise<
          FindNonAny<
            [Awaited<ReturnType<NonNullable<C['tvo']>>>, Awaited<R>, Awaited<ReturnType<NonNullable<D['onResponse']>>>]
          >
        >
    : never
  : never;

export type APIMapTransformMethods<
  M extends APIMap | Record<string, APIConfig>,
  D extends DefaultAPIConfig = DefaultAPIConfig,
> = {
  [K in keyof M]: M[K] extends APIConfig
    ? APITransformMethod<M[K], D, false>
    : APIMapTransformMethods<M[K] & Record<string, APIConfig>, D>;
} & {
  [K in keyof M as M[K] extends APIConfig ? `${K & string}Custom` : never]: APITransformMethod<
    KCast<M[K], APIConfig>,
    D,
    true
  >;
};
