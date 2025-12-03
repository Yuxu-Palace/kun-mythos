import type { KAnyFunc, KCast, KEqual, KFunc } from '@/types/base';
import type { Empty } from '@/types/private';

/** 请求方法 */
export type RequestMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD' | 'OPTIONS' | (string & {});

type Parser = 'json' | 'text' | 'blob' | 'arrayBuffer' | 'formData' | 'bytes' | 'stream' | (string & {});

type RequestMode<E extends string = string & {}> = 'mock' | 'network' | E;

type EmptyUnwrap<UserR = Empty, T = any> = KEqual<UserR, Empty> extends true ? T : UserR;

interface ParserResultMap<UserR = Empty> {
  json: EmptyUnwrap<UserR>;
  text: string;
  blob: Blob;
  arrayBuffer: ArrayBuffer;
  formData: FormData;
  bytes: Uint8Array;
  stream: ReadableStream;
}

type ParserResult<P extends Parser, UserR = Empty> = P extends keyof ParserResultMap
  ? ParserResultMap<UserR>[P]
  : EmptyUnwrap<UserR>;

type ParserReturn<RM extends RequestMode, P extends Parser, ReqOutput, UserR = Empty> = RM extends 'network'
  ? ParserResult<P, UserR>
  : EmptyUnwrap<UserR, RM extends 'mock' ? ReqOutput : any>;

type URLParamParser<U extends string, Param extends string = never> = U extends `${string}/:${infer P}/${infer Rest}`
  ? URLParamParser<`/${Rest}`, Param | P>
  : U extends `${string}/:${infer P}`
    ? P | Param
    : Param;

type CheckNonParamUrlAPIConfig<A extends APIConfig> = KEqual<URLParamParser<A['url']>, never>;

export interface BaseAPIConfig<
  Input = any,
  Output = any,
  ReqOutput = any,
  ResOutput = any,
  DefaultConfig extends DefaultAPIConfig = DefaultAPIConfig,
  ReqModeMapKeys extends string = string & {},
  Url extends string = string,
> extends RequestInit {
  /**
   * 请求地址
   *
   * @example '/api/user'
   * @example 'https://example.com/api/user'
   */
  url: Url;
  params?: Record<URLParamParser<Url>, string>;
  /** 请求模式 */
  requestMode?: RequestMode<ReqModeMapKeys>;
  /** 请求方法 */
  method?: RequestMethod | Lowercase<RequestMethod>;
  /**
   * 响应体解析方式
   * 如果存在 onResponse 的话, 则会使用 onResponse 的返回值, 如果想要屏蔽 onReponse 的继承, 则应该设置 onReponse 为 null
   *
   * @default 'json'
   */
  parser?: Parser;
  /**
   * transform data transfer object
   *
   * @description hook 顺序: tdto -> onRequest -> onResponse/parser -> tvo
   */
  tdto?: ((data: Input) => any) | null;
  /**
   * transform view object
   *
   * @description hook 顺序: tdto -> onRequest -> onResponse/parser -> tvo
   */
  tvo?:
    | ((data: Awaited<FindNonAny<[ResOutput, ReturnType<NonNullable<DefaultConfig['onResponse']>>]>>) => Output)
    | null;
  /**
   * 请求前 hook
   *
   * @description hook 顺序: tdto -> onRequest -> onResponse/parser -> tvo
   */
  onRequest?:
    | ((req: Request, config: RequestAPIConfig<Input, Output, ReqOutput, ResOutput, ReqModeMapKeys>) => ReqOutput)
    | null;
  /**
   * 响应前 hook
   * 会覆盖 parser 的解析方式
   *
   * @description hook 顺序: tdto -> onRequest -> onResponse/parser -> tvo
   */
  onResponse?:
    | ((res: Response, config: RequestAPIConfig<Input, Output, ReqOutput, ResOutput, ReqModeMapKeys>) => ResOutput)
    | null;
}

export interface DefaultAPIConfig<
  Input = any,
  Output = any,
  ReqOutput = any,
  ResOutput = any,
  ReqModeMapKeys extends string = string & {},
> extends Omit<BaseAPIConfig<Input, Output, ReqOutput, ResOutput, DefaultAPIConfig, ReqModeMapKeys>, 'url'> {
  /** 基本地址 */
  baseUrl?: string;
  /** 请求模式 map */
  requestModeMap?: Record<
    ReqModeMapKeys,
    (config: RequestAPIConfig<Input, Output, ReqOutput, ResOutput, ReqModeMapKeys>) => any
  >;
}

export interface RequestAPIConfig<
  Input = any,
  Output = any,
  ReqOutput = any,
  ResOutput = any,
  ReqModeMapKeys extends string = string & {},
> extends DefaultAPIConfig<Input, Output, ReqOutput, ResOutput, ReqModeMapKeys>,
    APIConfig<Input, Output, ReqOutput, ResOutput, DefaultAPIConfig, ReqModeMapKeys> {
  /** 请求数据 */
  data?: Input;
  oriUrl: string;
}

// export interface MockAPIConfig<
//   Input = any,
//   Output = any,
//   ReqOutput = any,
//   ResOutput = any,
//   DefaultConfig extends DefaultAPIConfig = DefaultAPIConfig,
//   ReqModeMapKeys extends string = string & {},
// > extends BaseAPIConfig<Input, Output, ReqOutput, ResOutput, DefaultConfig, ReqModeMapKeys> {
//   requestMode: 'mock';
// }

/**
 * API config
 */
export type APIConfig<
  Input = any,
  Output = any,
  ReqOutput = any,
  ResOutput = any,
  DefaultConfig extends DefaultAPIConfig = DefaultAPIConfig,
  ReqModeMapKeys extends string = string & {},
  Url extends string = string,
> = BaseAPIConfig<Input, Output, ReqOutput, ResOutput, DefaultConfig, ReqModeMapKeys, Url>;
// | MockAPIConfig<Input, Output, ReqOutput, ResOutput, DefaultConfig, ReqModeMapKeys>;

export type CallAPIConfig<
  Input = any,
  Output = any,
  ReqOutput = any,
  ResOutput = any,
  DefaultConfig extends DefaultAPIConfig = DefaultAPIConfig,
  ReqModeMapKeys extends string = string & {},
  Url extends string = string,
> = Omit<APIConfig<Input, Output, ReqOutput, ResOutput, DefaultConfig, ReqModeMapKeys, Url>, 'url'>;

export type DefineAPIConfig<U extends string> = APIConfig<any, any, any, any, any, any, U>;

/** API map */
export type APIMap<U extends string = string & {}> = Record<
  string,
  DefineAPIConfig<U> | Record<string, DefineAPIConfig<U>>
>;

export type IsUnknownAny<T> = KEqual<T, any> extends true ? true : KEqual<T, unknown> extends true ? true : false;

export type FindNonAny<T extends any[], Other = Empty> = T extends [infer F, ...infer Last]
  ? IsUnknownAny<F> extends true
    ? FindNonAny<Last>
    : F extends Other
      ? FindNonAny<Last>
      : F
  : any;

type APIHandlerArgs<I, C extends CallAPIConfig, Custom, NonParamUrl extends boolean> = FindNonAny<
  [NonParamUrl extends true ? any : [I, C & Required<Pick<C, 'params'>>], Custom extends true ? [I?, C?] : [I?], [I?]]
>;

type DefineRequestModes<D extends DefaultAPIConfig> = keyof NonNullable<D['requestModeMap']> & string;

// type PlainDefaultConfig<D extends DefaultAPIConfig> = Omit<D, 'requestMode'>;

// type CustomRequestModeResult<A extends APIConfig, D extends DefaultAPIConfig> = FindNonAny<
//   [A['requestMode'], D['requestMode']]
// > extends infer ReqMode
//   ? ReqMode extends 'mock'
//     ? any
//     : Awaited<ReturnType<NonNullable<NonNullable<D['requestModeMap']>[ReqMode & string]>>>
//   : any;

type RealProp<
  P extends keyof DefaultAPIConfig & keyof APIConfig,
  C extends Pick<APIConfig, P>,
  A extends Pick<APIConfig, P>,
  D extends DefaultAPIConfig,
  Other = Empty,
> = FindNonAny<[C[P], A[P], D[P]], Other>;

type OnResponseReturn<OnResponse> = OnResponse extends KAnyFunc ? ReturnType<OnResponse> : any;

type CustomCallConfigUnwrap<C extends CallAPIConfig, Custom extends boolean> = Custom extends true
  ? {
      [K in keyof C as undefined extends C[K] ? never : K]: C[K];
    }
  : Record<never, Empty>;

interface Pack<T> {
  value: T;
}

type PackUnwrap<P> = P extends Pack<any> ? P['value'] : P;

type CustomRequestModeReturn<
  RealRM extends RequestMode,
  InputD extends DefaultAPIConfig,
  CustomReq = NonNullable<InputD['requestModeMap']>[RealRM],
> = IsUnknownAny<RealRM> extends true
  ? any
  : KEqual<RealRM, string> extends true
    ? any
    : CustomReq extends KAnyFunc
      ? Pack<ReturnType<CustomReq>>
      : any;

type APIHandlerResult<
  AConfig extends APIConfig,
  CallConfig extends CallAPIConfig = APIConfig,
  UserR = Empty,
  InputDefault extends DefaultAPIConfig = DefaultAPIConfig,
  ReqOutput = any,
  Custom extends boolean = false,
  CC extends CallAPIConfig = CustomCallConfigUnwrap<CallConfig, Custom>,
> = Awaited<
  PackUnwrap<
    FindNonAny<
      [
        // 如果有用户自定义返回值, 则直接应用
        EmptyUnwrap<UserR>,
        // 获取实际自定义请求的结果
        CustomRequestModeReturn<NonNullable<RealProp<'requestMode', CC, AConfig, InputDefault>>, InputDefault>,
        // 获取实际 tvo 的结果
        ReturnType<KCast<RealProp<'tvo', CC, AConfig, InputDefault>, KAnyFunc>>,
        // 获取实际 onResponse 的结果
        OnResponseReturn<RealProp<'onResponse', CC, AConfig, InputDefault>>,
        // 获取实际 parser 的结果
        ParserReturn<
          NonNullable<RealProp<'requestMode', CC, AConfig, InputDefault>>,
          NonNullable<RealProp<'parser', CC, AConfig, InputDefault>>,
          ReqOutput,
          UserR
        >,
      ],
      undefined | null
    >
  >
>;

// export type APITransformMethod<
//   A extends APIConfig,
//   InputD extends DefaultAPIConfig = DefaultAPIConfig,
//   Custom extends boolean = false,
//   D extends DefaultAPIConfig = PlainDefaultConfig<InputD>,
// > = A extends APIConfig<infer Input, infer Output, infer ReqOutput, infer ResOutput, D>
//   ? FindNonAny<
//       [CustomRequestModeResult<A, InputD>, Output, ResOutput, A['requestMode'] extends 'mock' ? ReqOutput : any]
//     > extends infer Res
//     ? IsUnknownAny<Res> extends true
//       ? <
//           R = Empty,
//           I extends Input = Input,
//           C extends CallAPIConfig<I, any, ReqOutput, ResOutput, InputD, DefineRequestModes<D>> = CallAPIConfig<
//             I,
//             any,
//             ReqOutput,
//             ResOutput,
//             InputD,
//             DefineRequestModes<D>
//           >,
//         >(
//           ...args: ApiConfigParams<I, C, Custom>
//         ) => Promise<APIFuncResult<A, KCast<C, Partial<APIConfig>>, R, InputD, ReqOutput, Custom>>
//       : <
//           I extends Input,
//           R extends Res = Res,
//           C extends CallAPIConfig<I, any, ReqOutput, ResOutput, InputD, DefineRequestModes<D>> = CallAPIConfig<
//             I,
//             any,
//             ReqOutput,
//             ResOutput,
//             InputD,
//             DefineRequestModes<D>
//           >,
//         >(
//           ...args: ApiConfigParams<I, C, Custom>
//         ) => Promise<APIFuncResult<A, KCast<C, Partial<APIConfig>>, R, InputD, ReqOutput, Custom>>
//     : never
//   : never;

type APIInputType<
  A extends Pick<APIConfig, 'tdto'> = APIConfig,
  D extends Pick<DefaultAPIConfig, 'tdto'> = DefaultAPIConfig,
> = Parameters<KCast<FindNonAny<[A['tdto'], D['tdto']], undefined | null>, (...args: any[]) => any>>[0];

type PropResult<A extends APIConfig, P extends keyof A> = A[P] extends KAnyFunc ? ReturnType<A[P]> : unknown;

export type APITransformMethod<
  A extends APIConfig,
  InputD extends DefaultAPIConfig = DefaultAPIConfig,
  Custom extends boolean = false,
  NonParamUrl extends boolean = CheckNonParamUrlAPIConfig<A>,
> = <
  R = Empty,
  I extends APIInputType<A, InputD> = APIInputType<A, InputD>,
  C extends CallAPIConfig<
    I,
    any,
    PropResult<A, 'onRequest'>,
    PropResult<A, 'onResponse'>,
    InputD,
    DefineRequestModes<InputD>,
    A['url']
  > = CallAPIConfig<
    I,
    any,
    PropResult<A, 'onRequest'>,
    PropResult<A, 'onResponse'>,
    InputD,
    DefineRequestModes<InputD>,
    A['url']
  >,
>(
  ...args: APIHandlerArgs<
    KEqual<I, APIInputType<A, InputD>> extends true ? APIInputType<C, { tdto: KFunc<[I]> }> : I,
    C,
    Custom,
    NonParamUrl
  >
) => Promise<
  APIHandlerResult<
    A,
    KCast<C, Partial<APIConfig>>,
    R,
    InputD,
    ReturnType<KCast<RealProp<'onRequest', C, A, InputD>, KAnyFunc>>,
    Custom
  >
>;

export type APIMapTransformMethods<
  M extends APIMap | Record<string, APIConfig>,
  D extends DefaultAPIConfig = DefaultAPIConfig,
> = {
  // 普通请求方法
  [K in keyof M as M[K] extends APIConfig
    ? // 如果 url 中不存在 param 参数 则直接使用, 否则忽略
      CheckNonParamUrlAPIConfig<M[K]> extends true
      ? K
      : never
    : // 不是 APIConfig 的话就是嵌套的 api map, 直接返回 K 即可
      K]: M[K] extends APIConfig
    ? APITransformMethod<M[K], D, false>
    : APIMapTransformMethods<KCast<M[K], Record<string, APIConfig>>, D>;
} & {
  // 支持自定义配置请求方法
  [K in keyof M as M[K] extends APIConfig ? `${K & string}Custom` : never]: APITransformMethod<
    KCast<M[K], APIConfig>,
    D,
    true
  >;
};
