import { parseSourceWithKeyPath, setTarget } from './pick-rename';

type TransformFn<T, R = any> = (value: any, source: any, origin: T) => R;

/**
 * 数据降级
 *
 * 对不满足验证方法的数据进行降级处理
 *
 * @platform web, node, webworker
 * @example
 * ```js
 * const fullbackArray = fullback(isArray, () => []);
 * fullbackArray(1) // []
 * fullbackArray([1]) // [1]
 * ```
 */
export function fullback<T extends TransformFn<any>>(verifyFn: TransformFn<any>, transformFn: T) {
  return ((...args) => {
    if (verifyFn(...args)) {
      return args[0];
    }
    return transformFn(...args);
  }) as TransformFn<any, ReturnType<T>>;
}

/**
 * 对指定路径的数据应用转换函数
 *
 * @platform web, node, webworker
 * @warn 该函数会直接修改传入的对象
 * @example
 * ```js
 * const testObj = { needArray: 123 };
 * const transformArray = fullback(isArray, () => []);
 * applyTransform('needArray', transformArray, testObj); // { needArray: [] }
 * ```
 */
export function applyTransform<
  R extends Record<PropertyKey, any>,
  I extends Record<PropertyKey, any> = Record<PropertyKey, any>,
>(keyPath: string, transformFn: TransformFn<I>, obj: I): I & R {
  const [source, , value] = parseSourceWithKeyPath(keyPath, obj);

  const newValue = transformFn(value, source, obj);

  setTarget(keyPath, obj, newValue);

  return obj as I & R;
}

type TransformInfo = [string, TransformFn<any>];

/**
 * 应用一批转换函数
 *
 * @platform web, node, webworker
 * @warn 该函数会直接修改传入的对象
 * @warn 转换函数的顺序会影响后续转换函数的取值
 * @see applyTransform
 */
export function applyTransforms<
  R extends Record<PropertyKey, any>,
  I extends Record<PropertyKey, any> = Record<PropertyKey, any>,
>(transformInfo: TransformInfo[], obj: I): I & R {
  for (let i = 0; i < transformInfo.length; i++) {
    const [keyPath, transformFn] = transformInfo[i];
    applyTransform(keyPath, transformFn, obj);
  }

  return obj as I & R;
}
