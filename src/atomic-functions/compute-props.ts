import { PRIVATE_KEY } from '@/constant/private';
import type { KAnyFunc, KFunc, KPrintify } from '@/types/base';
import { isFunction, isPromise, isString } from './verify';

type ComputeProps<T extends Record<PropertyKey, any>> = KPrintify<
  {
    [K in keyof T]: T[K] extends KAnyFunc ? Awaited<ReturnType<T[K]>> : Awaited<T[K]>;
  } & {
    [K in keyof T as K extends string
      ? T[K] extends KFunc<any[], Promise<any>> | Promise<any>
        ? `wait${Capitalize<K>}`
        : never
      : never]: T[K] extends KFunc<any[], infer R> ? R : T[K];
  } & {
    __k_ready: {
      [K in keyof T as T[K] extends KFunc<any[], Promise<any>> | Promise<any> ? K : never]: Promise<void>;
    };
  }
>;

/**
 * 计算属性的值
 *
 * 对于函数值, 会不传递任何参数执行函数, 将返回值作为对应 key 的值
 *
 * 对于 promise, 会等待 promise resolve, 将 resolve 后的值作为对应 key 的值
 *
 * @platform web, node, webworker
 *
 * @param obj 待计算属性的对象
 */
export function computeProps<T extends Record<PropertyKey, KAnyFunc | Promise<any> | (any & {})>>(
  obj: T,
): ComputeProps<T> {
  const result = { __k_ready: {} } as ComputeProps<T>;

  const keys = Reflect.ownKeys(obj);

  for (let i = 0; i < keys.length; ++i) {
    const key = keys[i];
    let value: any = obj[key];

    if (isFunction(value)) {
      value = Reflect.apply(value, obj, []);
    }

    if (isPromise(value)) {
      result.__k_ready[key] = value.then((_v: any) => {
        value = _v;
        return _v;
      });

      if (isString(key)) {
        Object.defineProperty(result, `wait${key[0].toUpperCase()}${key.slice(1)}`, {
          get: () => result.__k_ready[key],
        });
      }

      value = PRIVATE_KEY;

      Object.defineProperty(result, key, {
        get: () => {
          if (value === PRIVATE_KEY) {
            throw new Error('[computeProps]: value is not ready');
          }
          return value;
        },
      });

      continue;
    }

    // @ts-expect-error any
    result[key] = value;
  }

  return result;
}
