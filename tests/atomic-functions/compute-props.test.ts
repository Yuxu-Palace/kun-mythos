import { assertType, describe, expect, test } from 'vitest';
import { bench, loadModule, MFT } from '../utils';

MFT(({ computeProps: completeProps }, { format, IS_BENCH }) => {
  test('导出检查', () => {
    expect(typeof completeProps).toBe('function');
  });

  test('基本使用', async () => {
    expect(completeProps({})).toEqual({ __k_ready: {} });

    const baseObj = {
      a: 1,
      b: () => 2,
      c: async () => 3,
      d: new Promise<string>((r) => r('4')),
      e: new Promise<string>((r) => r('5')).then((v) => Number(v)),
      f() {
        return this.b() + 1;
      },
    };

    const obj1 = completeProps(baseObj);
    expect(obj1.__k_ready.c).toBeInstanceOf(Promise);
    expect(obj1.a).toBe(1);
    expect(obj1.b).toBe(2);
    expect(obj1.f).toBe(3);
    expect(() => obj1.c).toThrowError();
    expect(() => obj1.d).toThrowError();
    expect(() => obj1.e).toThrowError();
    await obj1.__k_ready.c;
    expect(obj1.c).toBe(3);
    await obj1.__k_ready.d;
    expect(obj1.d).toBe('4');
    await obj1.__k_ready.e;
    expect(obj1.e).toBe(5);
  });

  describe.runIf(IS_BENCH)(`${format}性能测试`, () => {
    bench('读取版本号', () => {});
  });
});

test('类型检查', async () => {
  const { computeProps: completeProps } = await loadModule();
  assertType<{ __k_ready: Record<PropertyKey, never> }>(completeProps({}));
  assertType<{
    a: number;
    b: string;
    c: number;
    d: string;
    e: number;
    __k_ready: Record<'b' | 'd' | 'e', Promise<void>>;
  }>(
    completeProps({
      a: 1,
      b: async () => '2',
      c: () => 3,
      d: new Promise<string>((r) => r('4')),
      e: new Promise<string>((r) => r('5')).then((v) => Number(v)),
    }),
  );
});
