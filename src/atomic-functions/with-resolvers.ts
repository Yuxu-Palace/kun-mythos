import { cacheGetterResult } from './cache-fn';
import { isFunction } from './verify';

type PromiseWithResolvers<T> = {
  promise: Promise<T>;
  resolve: (value: T | PromiseLike<T>) => void;
  reject: (reason?: any) => void;
};

/**
 * 获取 Promise 和对应的处理方法
 */
export const withResolvers = cacheGetterResult((): (<T>() => PromiseWithResolvers<T>) => {
  if (isFunction(Promise.withResolvers)) {
    return Promise.withResolvers;
  }

  return () => {
    const resolvers = { promise: null, resolve: null, reject: null } as unknown as PromiseWithResolvers<any>;

    resolvers.promise = new Promise((resolve, reject) => {
      resolvers.resolve = resolve;
      resolvers.reject = reject;
    });

    return resolvers;
  };
});
