import { describe, expect, test } from 'vitest';
import { bench, MFT } from '../utils';

MFT(({ cacheFn, clearFnCache }, { format, IS_BENCH }) => {
  test('导出检查', () => {
    expect(typeof cacheFn).toBe('function');
    expect(typeof clearFnCache).toBe('function');
  });

  const add = (a: number, b: number) => ({ result: a + b });

  test('基本使用', () => {
    const cf1 = cacheFn(add);
    const cf1r = cf1(1, 2);
    expect(cf1r).toEqual({ result: 3 });
    expect(cf1(1, 2)).toBe(cf1r);
    expect(cf1(1, 3)).toBe(cf1r);

    const cf2 = cacheFn(add);
    const cf2r = cf2(1, 2);
    expect(cf2r).toEqual({ result: 3 });
    expect(cf2(1, 2)).toBe(cf2r);
    expect(cf2(1, 3)).toBe(cf2r);

    expect(cf1).not.toBe(cf2);

    clearFnCache(cf1);
    expect(cf1(1, 2)).not.toBe(cf1r);

    cf2.clearCache();
    expect(cf2(1, 2)).not.toBe(cf2r);
  });

  test('边界情况', () => {
    // @ts-expect-error test
    expect(() => cacheFn()).toThrowError(TypeError);
    // @ts-expect-error test
    expect(() => cacheFn('')).toThrowError(TypeError);
    // @ts-expect-error test
    expect(() => clearFnCache()).toThrowError(TypeError);
    // @ts-expect-error test
    expect(() => clearFnCache('')).toThrowError(TypeError);
  });

  describe.runIf(IS_BENCH)(`${format}性能测试`, () => {
    bench('读取版本号', () => {});
  });
});
