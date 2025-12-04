import { describe, expect, test } from 'vitest';
import { getFuncLength, setFuncLength, syncFuncLength } from '@/private/fn-length';
import { MFT } from '~/tests/utils';

MFT((module, { format }) => {
  test(`${format} 导出检查`, () => {
    // @ts-expect-error 禁止导出
    expect(module.getFuncLength).toBeUndefined();
    // @ts-expect-error 禁止导出
    expect(module.setFuncLength).toBeUndefined();
    // @ts-expect-error 禁止导出
    expect(module.syncFuncLength).toBeUndefined();
  });
});

describe('fn-length', () => {
  test('基本使用', () => {
    expect(getFuncLength(() => {})).toBe(0);
    expect(getFuncLength((a: number) => a)).toBe(1);
    const testFn = (...args: number[]) => args;
    testFn.klength = 2;
    expect(getFuncLength(testFn)).toBe(2);
    setFuncLength(testFn, 3);
    expect(getFuncLength(testFn)).toBe(3);
    const test2 = () => {};
    syncFuncLength(test2, testFn);
    expect(getFuncLength(test2)).toBe(3);
  });

  test('边缘情况', () => {
    // 测试非数字长度参数
    const testFunc = () => {};
    expect(() => setFuncLength(testFunc, Number.NaN)).toThrowError(TypeError);
    expect(getFuncLength(testFunc)).toBe(0);

    // 测试负数长度参数
    expect(() => setFuncLength(testFunc, -1)).toThrowError(TypeError);
    expect(getFuncLength(testFunc)).toBe(0);

    // @ts-expect-error test
    expect(getFuncLength(null)).toBe(0);
    // @ts-expect-error test
    expect(getFuncLength(undefined)).toBe(0);
    // @ts-expect-error test
    expect(setFuncLength(null, 1)).toBeUndefined();
    // @ts-expect-error test
    expect(setFuncLength(undefined, 1)).toBeUndefined();
    // @ts-expect-error test
    expect(syncFuncLength(null, () => {})).toBeUndefined();
    // @ts-expect-error test
    expect(syncFuncLength(undefined, () => {})).toBeUndefined();
    // @ts-expect-error test
    expect(syncFuncLength(() => {}, null)).toBeUndefined();
    // @ts-expect-error test
    expect(syncFuncLength(() => {}, undefined)).toBeUndefined();
  });
});
