import { PRIVATE_KEY } from '../constant/private';
import type {
  KAppend,
  KDropHead,
  KFillArray,
  KFilterArray,
  KFunc,
  KInclude,
  KLength,
  KPatchArray,
} from '../types/base';
import type { KCurryFuncReturnType } from './curry';
import { setFuncLength, syncFuncLength } from './private/fn-length';
import { isFunction, isSymbol, isTrue } from './verify';

interface Flag<T extends number = number> {
  [PRIVATE_KEY]: true;
  id: T;
}

const FLAG_MAP = new Map<symbol, Flag<number>>();

const FLAG_PREFIX = '@yuxu-palace/kun-mythos:placeholderFuncWithSort:flag-';

function flag<T extends number>(id: T) {
  const _flag = Symbol(`${FLAG_PREFIX}${id}`);
  FLAG_MAP.set(_flag, { [PRIVATE_KEY]: true, id });
  return _flag as unknown as Flag<T>;
}

function checkFlag(_flag: any): _flag is Flag {
  const isFlag = isTrue((FLAG_MAP.get(_flag) || {})[PRIVATE_KEY]);
  if (!isFlag && isSymbol(_flag)) {
    const strFlag = _flag.toString().slice(7, -1);
    if (strFlag.startsWith(FLAG_PREFIX)) {
      throw new TypeError(`flag(${strFlag.slice(FLAG_PREFIX.length)}) 已被使用`);
    }
  }
  return isFlag;
}

function parseFlag(_flag: symbol) {
  // biome-ignore lint/style/noNonNullAssertion: 已前置处理
  return FLAG_MAP.get(_flag)!.id;
}

type PlaceholderArgs<T extends any[]> = KLength<T> extends 0 ? [] : { [K in keyof T]: T[K] | Flag };

type PlaceholderArgsVerify<
  T extends any[],
  F extends Flag[] = KFilterArray<Flag, T>,
  C extends any[] = [],
  E extends any[] = KFillArray<KLength<F>, never>,
> = E extends []
  ? T
  : KInclude<Flag<KLength<C>>, F> extends true
    ? PlaceholderArgsVerify<T, F, KAppend<never, C>, KDropHead<1, E>>
    : KFillArray<KLength<T>, Flag<KLength<C>>>;

type FilterPlainArgs<T extends any[], O extends any[], R extends any[] = []> = T extends [infer A, ...infer Last]
  ? A extends Flag
    ? FilterPlainArgs<Last, KDropHead<1, O>, KAppend<O[0], R>>
    : FilterPlainArgs<Last, KDropHead<1, O>, R>
  : R;

type PlaceholderFuncArgs<
  Args extends any[],
  Ori extends any[],
  Last extends any[] = KFillArray<KLength<Args>, never>,
> = Args extends [Flag<infer Idx>, ...infer Other]
  ? PlaceholderFuncArgs<Other, KDropHead<1, Ori>, KPatchArray<Last, Idx, Ori[0]>>
  : Last;

/**
 * 函数支持占位符和参数排序
 *
 * 包装并返回一个新函数, 新函数允许使用占位符替代传参, 占位符的位置后续传递即可, 占位符支持排序, 新函数会根据顺序重新排序参数
 *
 * 可选参数会被强制要求填写
 *
 * @platform web, node, webworker
 *
 * @warning 占位符必须通过 flag 函数生成并且从 0 开始不能重复, 且 flag 不应该被复用
 * @warning 占位符只能用于函数参数位置, 函数返回值位置无法使用占位符
 * @warning 无法与 curry 函数一起使用 (无法正确推导类型)! 具体看下方示例
 *
 * @example
 * import { placeholderFuncWithSort } from '@yuxu-palace/kun-mythos';
 * const add = (a: number, b: string, c: number, d: boolean) => a + b + c + d;
 * // const func = curry(placeholderFuncWithSort(add)); // 这么使用无法正确推导类型
 * // const func = placeholderFuncWithSort(curry(add)); // 这个不影响使用
 * const { flag } = placeholderFuncWithSort;
 * const func = placeholderFuncWithSort(add);
 * const f1 = func(1, flag(1), 3, flag(0));
 * f1(false, '2'); // '123false'
 * // 占位函数生成后可使用 curry 函数包裹
 * const f2 = curry(f1);
 * f2(false, '2'); // '123false'
 * f2(false)('2'); // '123false'
 * f2()(false)('2'); // '123false'
 */
export function placeholderFuncWithSort<O extends any[], R>(func: KFunc<O, R>) {
  if (!isFunction(func)) {
    throw new TypeError('func 必须是函数');
  }

  const callback = <A extends PlaceholderArgs<Required<O>>>(...placeArgs: PlaceholderArgsVerify<A>) => {
    const argsInfo: [number, number][] = [];
    const _placeArgs = Array.from(placeArgs);
    for (let i = 0; i < _placeArgs.length; i++) {
      const placeArg = _placeArgs[i];
      if (checkFlag(placeArg)) {
        // 这个 placeArg 是 Flag 类型的 Symbol
        argsInfo.push([i, parseFlag(placeArg as any)]);
        FLAG_MAP.delete(placeArg as any);
      }
    }

    const runFunc = (...callArgs: any[]) => {
      if (callArgs.length !== argsInfo.length) {
        throw new TypeError(`非法调用, 参数数量不匹配, 期望: ${argsInfo.length}, 实际: ${callArgs.length}`);
      }

      const args = Array.from(_placeArgs) as any[];

      for (let i = 0; i < argsInfo.length; i++) {
        const [argIndex, flagId] = argsInfo[i];
        args[argIndex] = callArgs[flagId];
      }

      return func(...(args as any));
    };

    setFuncLength(runFunc, argsInfo.length);

    return runFunc as KFunc<
      PlaceholderFuncArgs<KFilterArray<Flag, A>, FilterPlainArgs<A, Required<O>>>,
      KCurryFuncReturnType<R>
    >;
  };

  syncFuncLength(callback, func);
  return callback;
}

/** 带有排序的站位符 */
placeholderFuncWithSort.flag = flag;
