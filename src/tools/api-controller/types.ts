import type { KCast, KEqual } from '@/types/base';

export type RequestMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD' | 'OPTIONS';

export interface BaseAPIConfig<
  Input = any,
  Output = any,
  MockReqOutput = any,
  MockResOutput = any,
  DefaultConfig extends DefaultAPIConfig = DefaultAPIConfig,
> extends RequestInit {
  url: string;
  mock?: boolean;
  method?: RequestMethod;
  parser?: 'json' | 'text' | 'blob' | 'arrayBuffer' | 'formData' | 'bytes' | 'stream';
  tdto?: (data: Input) => any;
  tvo?: (
    data: FindNonAny<[Awaited<MockResOutput>, Awaited<ReturnType<NonNullable<DefaultConfig['onResponse']>>>]>,
  ) => Output;
  onRequest?: (data: Request, config: RequestAPIConfig<Input, Output>) => MockReqOutput;
  onResponse?: (data: Response, config: RequestAPIConfig<Input, Output>) => MockResOutput;
}

export interface DefaultAPIConfig<Input = any, Output = any, MockReqOutput = any, MockResOutput = any>
  extends Omit<BaseAPIConfig<Input, Output, MockReqOutput, MockResOutput>, 'url'> {
  baseUrl?: string;
}

export interface RequestAPIConfig<Input = any, Output = any, MockReqOutput = any, MockResOutput = any>
  extends DefaultAPIConfig<Input, Output, MockReqOutput, MockResOutput>,
    BaseAPIConfig<Input, Output, MockReqOutput, MockResOutput> {
  data?: Input;
}

export interface MockAPIConfig<
  Input = any,
  Output = any,
  MockReqOutput = any,
  MockResOutput = any,
  DefaultConfig extends DefaultAPIConfig = DefaultAPIConfig,
> extends BaseAPIConfig<Input, Output, MockReqOutput, MockResOutput, DefaultConfig> {
  mock: true;
  method?: 'POST' | 'PUT' | 'PATCH';
}

export type APIConfig<
  Input = any,
  Output = any,
  MockReqOutput = any,
  MockResOutput = any,
  DefaultConfig extends DefaultAPIConfig = DefaultAPIConfig,
> =
  | BaseAPIConfig<Input, Output, MockReqOutput, MockResOutput, DefaultConfig>
  | MockAPIConfig<Input, Output, MockReqOutput, MockResOutput, DefaultConfig>;

export type APIMap = Record<string, APIConfig | Record<string, APIConfig>>;

export type IsUnknownAny<T> = KEqual<T, any> extends true ? true : KEqual<T, unknown> extends true ? true : false;

export type FindNonAny<T extends any[]> = T extends [infer F, ...infer Last]
  ? IsUnknownAny<F> extends true
    ? FindNonAny<Last>
    : F
  : any;

type ApiConfigParams<I, C, Custom> = Custom extends true ? [I?, C?] : [I?];

export type APITransformMethod<
  A extends APIConfig,
  D extends DefaultAPIConfig = DefaultAPIConfig,
  Custom extends boolean = false,
> = A extends APIConfig<infer Input, infer Output, infer MockReqOutput, infer MockResOutput, D>
  ? FindNonAny<[Output, MockResOutput, A['mock'] extends true ? MockReqOutput : any]> extends infer Res
    ? IsUnknownAny<Res> extends true
      ? <
          R extends Output,
          I extends Input = Input,
          C extends Omit<APIConfig<I, Output, MockReqOutput, MockResOutput, D>, 'url'> = Omit<
            APIConfig<I, Output, MockReqOutput, MockResOutput, D>,
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
          C extends Omit<APIConfig<I, Output, MockReqOutput, MockResOutput, D>, 'url'> = Omit<
            APIConfig<I, Output, MockReqOutput, MockResOutput, D>,
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
