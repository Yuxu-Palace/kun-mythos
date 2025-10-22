import { cacheFn } from './cache-fn';

export function singleton<T extends new (...args: any[]) => any>(ClassName: T): T {
  const proxy = new Proxy(ClassName, {
    construct: cacheFn<Required<ProxyHandler<T>>['construct']>(Reflect.construct),
  });

  proxy.prototype.constructor = proxy;

  return proxy;
}
