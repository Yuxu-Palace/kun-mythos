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

  test('带参数的构造函数', () => {
    class B {
      value: number;
      constructor(value: number) {
        this.value = value;
      }
    }
    const SingletonB = singleton(B);

    const b1 = new SingletonB(1);
    const b2 = new SingletonB(2);

    // 验证单例行为:应忽略后续参数,返回同一实例
    expect(b1).toBe(b2);
    expect(b1.value).toBe(1); // 应保留首次构造的参数值
  });
});
