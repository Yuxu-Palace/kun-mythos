import { cacheFn } from './cache-fn';

/**
 * 单例包装器
 * @platform web, node, webworker
 *
 * @example
 * ```js
 * class A {}
 * const B = singleton(A)
 * const b = new B()
 * const b2 = new B()
 * b === b2 // true
 * b2 instanceof A // true
 * ```
 */
export function singleton<T extends new (...args: any[]) => any>(ClassName: T): T {
  const proxy = new Proxy(ClassName, {
    construct: cacheFn<Required<ProxyHandler<T>>['construct']>(Reflect.construct),
  });

  proxy.prototype.constructor = proxy;

  return proxy;
}
