import { expect, test } from 'vitest';
import { MFT } from '../utils';

MFT(({ withResolvers, isPromise, isFunction, unCacheFn }) => {
  test('导出检查', () => {
    expect(typeof withResolvers).toBe('function');
  });

  test('基本使用', async () => {
    const resolvers1 = withResolvers();
    expect(isPromise(resolvers1.promise)).toBe(true);
    expect(isFunction(resolvers1.resolve)).toBe(true);
    expect(isFunction(resolvers1.reject)).toBe(true);
    resolvers1.resolve(1);
    expect(await resolvers1.promise).toBe(1);

    const old = Promise.withResolvers;
    if (isFunction(Promise.withResolvers)) {
      Promise.withResolvers = null as any;
    } else {
      Promise.withResolvers = unCacheFn(withResolvers);
    }

    withResolvers.clearCache();
    const resolvers2 = withResolvers();
    Promise.withResolvers = old;
    expect(isPromise(resolvers2.promise)).toBe(true);
    expect(isFunction(resolvers2.resolve)).toBe(true);
    expect(isFunction(resolvers2.reject)).toBe(true);
    resolvers2.resolve(2);
    expect(await resolvers2.promise).toBe(2);
  });
});
