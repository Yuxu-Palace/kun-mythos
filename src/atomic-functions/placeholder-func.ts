import { __ } from '@/constant/public';
import type { KAppend, KDropHead, KFunc, KHeadType } from '@/types/base';
import type { KCurryFuncReturnType } from './curry';
import { getFuncLength, setFuncLength, syncFuncLength } from './private/fn-length';
import { isFunction } from './verify';

type PlaceholderSymbol = typeof __;

type PlaceholderFuncArgs<Args extends any[], Ori extends any[], Last extends any[] = []> = Args extends [
  infer A,
  ...any,
]
  ? PlaceholderFuncArgs<
      KDropHead<1, Args>,
      KDropHead<1, Ori>,
      A extends PlaceholderSymbol ? KAppend<KHeadType<Ori>, Last> : Last
    >
  : Last;

type PlaceholderArgs<T extends any[], R extends any[] = []> = T extends [infer A, ...any]
  ? PlaceholderArgs<KDropHead<1, T>, KAppend<A | PlaceholderSymbol, R>>
  : R;

/**
 * 函数支持占位符
 *
 * 包装并返回一个新函数, 新函数允许使用占位符替代传参, 占位符的位置后续传递即可
 *
 * 可选参数会被强制要求填写
 *
 * @platform web, node, webworker
 *
 * @warning 占位符只能用于函数参数位置, 函数返回值位置无法使用占位符
 * @warning 无法与 curry 函数一起使用 (无法正确推导类型)! 具体看下方示例
 *
 * @example
 * import { __, placeholderFunc } from '@yuxu-palace/kun-mythos';
 * // const { __ } = placeholderFunc; // 也可以使用 placeholderFunc.__
 * const add = (a: number, b: string, c: number, d: boolean) => a + b + c + d;
 * // const func = curry(placeholderFunc(add)); // 这么使用无法正确推导类型
 * // const func = placeholderFunc(curry(add)); // 这个不影响使用
 * const func = placeholderFunc(add);
 * const f1 = func(1, __, 3, __);
 * f1('2', false); // '123false'
 * // 占位函数生成后可使用 curry 函数包裹
 * const f2 = curry(f1);
 * f2('2', false); // '123false'
 * f2('2')(false); // '123false'
 * f2()('2')(false); // '123false'
 */
export function placeholderFunc<O extends any[], R>(func: KFunc<O, R>) {
  if (!isFunction(func)) {
    throw new TypeError('func 必须是函数');
  }
  const callback = <A extends PlaceholderArgs<Required<O>>>(...placeArgs: A) => {
    const args = placeArgs.slice();
    const placeholderIndexes: number[] = [];
    for (let i = 0; i < args.length; i += 1) {
      if (args[i] === __) {
        placeholderIndexes.push(i);
      }
    }

    const runFunc = ((...callArgs) => {
      if (callArgs.length !== placeholderIndexes.length) {
        throw new TypeError(`非法调用, 参数数量不匹配, 期望: ${getFuncLength(runFunc)}, 实际: ${callArgs.length}`);
      }

      for (let i = 0; i < placeholderIndexes.length; i += 1) {
        args[placeholderIndexes[i]] = callArgs[i];
      }

      return func(...(args as any));
    }) as KFunc<PlaceholderFuncArgs<A, Required<O>>, KCurryFuncReturnType<R>>;

    setFuncLength(runFunc, placeholderIndexes.length);
    return runFunc;
  };

  syncFuncLength(callback, func);
  return callback;
}

/** 占位符 */
placeholderFunc.__ = __;
