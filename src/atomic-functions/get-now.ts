import { cacheGetterResult } from './cache-fn';

/**
 * 获取当前时间
 *
 * @platform web, node, webworker
 */
export const getNow = cacheGetterResult(() => {
  if (performance.now) {
    return () => performance.now();
  }
  return () => Date.now();
});
