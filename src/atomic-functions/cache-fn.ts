import { PRIVATE_KEY } from '@/constant/private';
import type { KAnyFunc, KFunc } from '@/types/base';
import { checkPrivateType, getPrivateMeta, setPrivateMeta } from './private/private-info-ctrl';
import { isFunction, isNullOrUndef } from './verify';

const CACHE_FN_KEY = Symbol('cacheFn');

type CacheFn<F extends KAnyFunc> = F & {
  clearCache: () => void;
};

/**
 * 获取缓存函数的元信息
 *
 * @param cf 缓存函数
 */
function getCacheFnMeta<T extends KAnyFunc>(cf: CacheFn<T>) {
  return getPrivateMeta(cf, CACHE_FN_KEY) as { oriFunc: T; result: ReturnType<T> | symbol };
}

/**
 * 设置缓存函数的元信息
 *
 * @param func 缓存函数
 * @param meta 元信息
 */
function setCacheFnMeta<T extends KAnyFunc>(func: CacheFn<T>, meta: Partial<ReturnType<typeof getCacheFnMeta<T>>>) {
  setPrivateMeta(func, CACHE_FN_KEY, meta);
}

/**
 * 判断是否是缓存函数
 *
 * @param func 待判断的函数
 */
export function isCacheFn(func: KAnyFunc): func is CacheFn<KAnyFunc> {
  return checkPrivateType(func, CACHE_FN_KEY);
}

/**
 * 获取原始函数
 *
 * @param func 待处理的函数
 */
export function unCacheFn<F extends KAnyFunc>(func: CacheFn<F>): F {
  if (isCacheFn(func)) {
    return getCacheFnMeta(func).oriFunc;
  }
  return func;
}

/**
 * 缓存函数返回结果
 *
 * @param func 待缓存的函数
 */
export function cacheFn<F extends KAnyFunc>(func: F): CacheFn<F> {
  if (!isFunction(func)) {
    throw new TypeError('func is not a function');
  }

  func = unCacheFn(func as any);

  const cb: any = function (this: any, ...args: any[]) {
    let result = getCacheFnMeta(cb).result;

    if (result === PRIVATE_KEY) {
      result = Reflect.apply(func, this, args);
      setCacheFnMeta(cb, { result });
    }

    return result;
  };

  setCacheFnMeta(cb, { result: PRIVATE_KEY, oriFunc: func });

  cb.clearCache = clearFnCache.bind(null, cb);

  return cb as unknown as CacheFn<F>;
}

/**
 * 清除函数的缓存
 *
 * @param func 待清除缓存的函数
 */
export function clearFnCache(func: KAnyFunc) {
  if (!isFunction(func)) {
    throw new TypeError('func is not a function');
  }
  if (!isCacheFn(func)) {
    return false;
  }
  setCacheFnMeta(func, { result: PRIVATE_KEY });
  return true;
}

/**
 * 带有重试机制的缓存方法
 *
 * @param func 待缓存的函数
 *
 * 如果函数返回值为 null 或 undefined, 则不会缓存结果
 */
export function retryCacheFn<F extends KAnyFunc>(func: F): CacheFn<F> {
  if (!isFunction(func)) {
    throw new TypeError('func is not a function');
  }

  const tempCB = cacheFn(func);

  const cb = function (this: any, ...args: any[]) {
    const result = Reflect.apply(tempCB, this, args);

    if (isNullOrUndef(result)) {
      tempCB.clearCache();
    }

    return result;
  } as unknown as CacheFn<F>;

  setCacheFnMeta(cb, getCacheFnMeta(tempCB));
  cb.clearCache = tempCB.clearCache;

  return cb;
}

/**
 * 缓存一段时间函数的返回结果, 时间结束后会自动清空缓存
 *
 * @param func 待缓存的函数
 * @param cacheTime 缓存时间
 */
export function debounceCacheFn<F extends KAnyFunc>(func: F, cacheTime = 100): CacheFn<F> {
  if (!isFunction(func)) {
    throw new TypeError('func is not a function');
  }

  const tempCB = cacheFn(func);
  let timer: any;

  const cb = function (this: any, ...args: any[]) {
    clearTimeout(timer);

    timer = setTimeout(() => tempCB.clearCache(), cacheTime);

    return Reflect.apply(tempCB, this, args);
  } as unknown as CacheFn<F>;

  setCacheFnMeta(cb, getCacheFnMeta(tempCB));
  cb.clearCache = tempCB.clearCache;

  return cb;
}

/**
 * 将 getter 返回的函数当成 cacheFn 的入参
 *
 * @param getter 生成需要缓存的函数
 * @param clearTopCache 是否清除对于函数的缓存
 */
export function cacheFnFromGetter<F extends KFunc<[], KAnyFunc>>(
  getter: F,
  clearTopCache = false,
): CacheFn<ReturnType<F>> {
  if (!isFunction(getter)) {
    throw new TypeError('getter is not a function');
  }

  let func: KAnyFunc | null;

  const cb = cacheFn(function (this: any, ...args: any[]) {
    func ||= getter();

    if (!isFunction(func)) {
      throw new TypeError('getter return value is not a function, please check your getter or use cacheFn instead');
    }

    return Reflect.apply(func, this, args);
  });

  const clearCache = cb.clearCache;

  cb.clearCache = () => {
    if (clearTopCache) {
      func = null;
    }
    return clearCache();
  };

  return cb as CacheFn<ReturnType<F>>;
}

/**
 * 缓存 getter 函数的返回结果
 *
 * 如果结果为函数则自动调用
 *
 * @param getter 待缓存的函数
 *
 * @example
 * ```ts
 * const cachedGetter = cacheGetterResult(() => {
 *   console.log('Creating expensive function');
 *   return (x: number) => x * 2;
 * });
 *
 * // 第一次调用会执行 getter 并缓存返回的函数
 * cachedGetter(5); // 输出: "Creating expensive function", 返回: 10
 * // 后续调用直接使用缓存的函数
 * cachedGetter(10); // 返回: 20 (不再输出 "Creating expensive function")
 * ```
 */
export function cacheGetterResult<F extends KFunc<[], any>>(getter: F): CacheFn<ReturnType<F>> {
  if (!isFunction(getter)) {
    throw new TypeError('getter is not a function');
  }

  const tempCB = cacheFn(getter);

  const cb = function (this: any, ...args: any[]) {
    const result = unCacheFn(Reflect.apply(tempCB, this, []));
    setCacheFnMeta(cb, { oriFunc: result });

    if (isFunction(result)) {
      return Reflect.apply(result, this, args);
    }

    return result;
  };

  setCacheFnMeta(cb, { result: PRIVATE_KEY });
  cb.clearCache = tempCB.clearCache;

  return cb as unknown as CacheFn<ReturnType<F>>;
}
