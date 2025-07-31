import { cacheGetterResult } from './cache-fn';

export const getNow = cacheGetterResult(() => {
  if (performance.now) {
    return () => performance.now();
  }
  return () => Date.now();
});
