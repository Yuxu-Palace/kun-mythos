import { assertType, expect, test } from 'vitest';
import { loadModule, MFT } from '../utils';

MFT(({ computeProps }) => {
  test('导出检查', () => {
    expect(typeof computeProps).toBe('function');
  });

  test('基本使用', async () => {
    expect(computeProps({})).toEqual({ __k_ready: {} });
    const sym = Symbol('test');

    const baseObj = {
      a: 1,
      b: () => 2,
      c: async () => 3,
      d: new Promise<string>((r) => r('4')),
      e: new Promise<string>((r) => r('5')).then((v) => Number(v)),
      [sym]: async () => 'sym',
      f() {
        return this.b() + 1;
      },
    };

    const obj1 = computeProps(baseObj);
    expect(obj1.__k_ready.c).toBeInstanceOf(Promise);
    expect(obj1.a).toBe(1);
    expect(obj1.b).toBe(2);
    expect(obj1.f).toBe(3);
    expect(() => obj1.c).toThrowError();
    expect(() => obj1.d).toThrowError();
    expect(() => obj1.e).toThrowError();
    expect(() => obj1[sym]).toThrowError();
    const rc = await obj1.__k_ready.c;
    expect(obj1.c).toBe(3);
    expect(rc).toBe(3);
    await obj1.__k_ready.d;
    expect(obj1.d).toBe('4');
    await obj1.__k_ready.e;
    expect(obj1.e).toBe(5);
    await obj1.__k_ready[sym];
    expect(obj1[sym]).toBe('sym');

    const b = await obj1.waitC;
    expect(b).toBe(3);

    // @ts-expect-error test
    expect(obj1.waitA).toBeUndefined();
  });
});

test('类型检查', async () => {
  const { computeProps } = await loadModule();
  assertType<{ __k_ready: Record<PropertyKey, never> }>(computeProps({}));
  assertType<{
    a: number;
    b: string;
    c: number;
    d: string;
    e: number;
    waitB: Promise<string>;
    waitD: Promise<string>;
    waitE: Promise<number>;
    __k_ready: Record<'b' | 'd' | 'e', Promise<void>>;
  }>(
    computeProps({
      a: 1,
      b: async () => '2',
      c: () => 3,
      d: new Promise<string>((r) => r('4')),
      e: new Promise<string>((r) => r('5')).then((v) => Number(v)),
    }),
  );
});
