import { PRIVATE_KEY } from '@/constant/private';
import type { KAnyFunc } from '@/types/base';
import { isFunction } from './verify';

type CacheFn<F extends KAnyFunc> = F & { clearCache: () => void };

export function cacheFn<F extends KAnyFunc>(func: F): CacheFn<F> {
  if (!isFunction(func)) {
    throw new TypeError('func is not a function');
  }

  const cb = function (this: any, ...args: any[]) {
    if (cb[PRIVATE_KEY] === PRIVATE_KEY) {
      cb[PRIVATE_KEY] = Reflect.apply(func, this, args);
    }
    return cb[PRIVATE_KEY];
  };

  cb[PRIVATE_KEY] = PRIVATE_KEY;
  cb.clearCache = clearFnCache.bind(null, cb);

  return cb as unknown as CacheFn<F>;
}

export function clearFnCache(func: KAnyFunc) {
  if (!isFunction(func)) {
    throw new TypeError('func is not a function');
  }
  // @ts-expect-error 自定义属性
  func[PRIVATE_KEY] = PRIVATE_KEY;
}
