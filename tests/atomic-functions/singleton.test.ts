import { expect, test } from 'vitest';
import { MFT } from '../utils';

MFT(({ singleton }) => {
  test('导出检测', () => {
    expect(typeof singleton).toBe('function');
  });

  class A {}
  const SingletonA = singleton(A);
  const singletonA = new SingletonA();

  test('基本使用', () => {
    expect(singletonA).toBeInstanceOf(A);
    expect(singletonA).toBeInstanceOf(SingletonA);
    expect(singletonA).toBe(new SingletonA());
    expect(SingletonA.prototype.constructor).toBe(SingletonA);
    // @ts-expect-error test
    expect(new SingletonA.prototype.constructor()).toBe(singletonA);
  });
});
