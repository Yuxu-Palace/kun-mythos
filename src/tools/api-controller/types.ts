import type { KEqual } from '@/types/base';

export type RequestMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD' | 'OPTIONS';

export interface BaseAPIConfig<Input = any, Output = any, MockReqOutput = any, MockResOutput = any>
  extends RequestInit {
  url: string;
  mock?: boolean;
  method?: RequestMethod;
  parser?: 'json' | 'text' | 'blob' | 'arrayBuffer' | 'formData' | 'bytes' | 'stream';
  tdto?: (data: Input) => any;
  tvo?: (data: Awaited<MockResOutput>) => Output;
  onRequest?: (data: Request, config: RequestAPIConfig<Input, Output>) => MockReqOutput;
  onResponse?: (data: Response, config: RequestAPIConfig<Input, Output>) => MockResOutput;
}

export interface RequestAPIConfig<Input = any, Output = any, MockReqOutput = any, MockResOutput = any>
  extends BaseAPIConfig<Input, Output, MockReqOutput, MockResOutput> {
  data?: Input;
}

export interface MockAPIConfig<Input = any, Output = any, MockReqOutput = any, MockResOutput = any>
  extends BaseAPIConfig<Input, Output, MockReqOutput, MockResOutput> {
  mock: true;
  method?: 'POST' | 'PUT' | 'PATCH';
}

export type APIConfig<Input = any, Output = any, MockReqOutput = any, MockResOutput = any> =
  | BaseAPIConfig<Input, Output, MockReqOutput, MockResOutput>
  | MockAPIConfig<Input, Output, MockReqOutput, MockResOutput>;

export type APIMap = Record<string, APIConfig | Record<string, APIConfig>>;

export type IsUnknownAny<T> = KEqual<T, any> extends true ? true : KEqual<T, unknown> extends true ? true : false;

export type FindNonAny<T extends any[]> = T extends [infer F, ...infer Last]
  ? IsUnknownAny<F> extends true
    ? FindNonAny<Last>
    : F
  : any;

export type APITransformMethod<A extends APIConfig> = A extends APIConfig<
  infer Input,
  infer Output,
  infer MockReqOutput,
  infer MockResOutput
>
  ? FindNonAny<[Output, MockResOutput, A['mock'] extends true ? MockReqOutput : any]> extends infer Res
    ? IsUnknownAny<Res> extends true
      ? <R extends Output, I extends Input = Input>(
          data?: I,
          config?: Partial<APIConfig<I, Output, MockReqOutput, MockResOutput>>,
        ) => Promise<Awaited<R>>
      : <I extends Input, R extends Res = Res>(
          data?: I,
          config?: Partial<APIConfig<I, Output, MockReqOutput, MockResOutput>>,
        ) => Promise<Awaited<R>>
    : never
  : never;

export type APIMapTransformMethods<M extends APIMap | Record<string, APIConfig>> = {
  [K in keyof M]: M[K] extends APIConfig
    ? APITransformMethod<M[K]>
    : APIMapTransformMethods<M[K] & Record<string, APIConfig>>;
};
