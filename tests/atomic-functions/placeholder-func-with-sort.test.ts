import { assertType, describe, expect, test } from 'vitest';
import type { KEqual } from '../../src';
import { bench, loadModule, MFT } from '../utils';

MFT(({ placeholderFuncWithSort }, { IS_BENCH, format }) => {
  test('导出检测', () => {
    expect(typeof placeholderFuncWithSort).toBe('function');
    expect(typeof placeholderFuncWithSort.flag).toBe('function');
  });

  const flag = placeholderFuncWithSort.flag;

  test('基本使用', () => {
    expect(placeholderFuncWithSort((a: string, b: string) => a + b)(flag(0), '1')('2')).toBe('21');
    expect(placeholderFuncWithSort((a: string, b: string) => a + b)('1', flag(0))('2')).toBe('12');
    expect(placeholderFuncWithSort((a: string, b: string) => a + b)('1', '2')()).toBe('12');
    expect(placeholderFuncWithSort((a: string, b: string) => a + b)(flag(1), flag(0))('2', '1')).toBe('12');
  });

  test('边界情况', () => {
    // 无参数
    // @ts-expect-error
    expect(() => placeholderFuncWithSort()).toThrowError(TypeError);
    // 参数为 null
    // @ts-expect-error
    expect(() => placeholderFuncWithSort(null)).toThrowError(TypeError);
    // 空参调用
    // @ts-expect-error
    expect(() => placeholderFuncWithSort((_a: string, _b: number) => 1)(flag(0), 1)()).toThrowError(TypeError);
    expect(placeholderFuncWithSort((..._args: any[]) => 1).length).toBe(0);
    const flag0 = flag(0);
    placeholderFuncWithSort((a: number, b: string) => a + b)(flag0, '1');
    expect(() => placeholderFuncWithSort((a: number, b: string) => a + b)(flag0, '1')).toThrowError(TypeError);
  });

  describe.runIf(IS_BENCH)(`${format}性能测试`, () => {
    const f = (a: number, b: string, c: boolean) => a + b + c;

    bench('原函数', () => {
      f(1, '1', false);
    });

    bench('末尾占位符', () => {
      placeholderFuncWithSort(f)(1, '1', flag(0))(false);
    });

    bench('中间占位符', () => {
      placeholderFuncWithSort(f)(1, flag(0), false)('1');
    });

    bench('开头占位符', () => {
      placeholderFuncWithSort(f)(flag(0), '1', false)(1);
    });

    bench('无占位符', () => {
      placeholderFuncWithSort(f)(1, '1', false)();
    });

    bench('12 占位符', () => {
      placeholderFuncWithSort(f)(flag(0), flag(1), true)(1, '1');
    });

    bench('21 占位符', () => {
      placeholderFuncWithSort(f)(flag(1), flag(0), true)('1', 1);
    });

    bench('23 占位符', () => {
      placeholderFuncWithSort(f)(1, flag(0), flag(1))('1', false);
    });

    bench('32 占位符', () => {
      placeholderFuncWithSort(f)(1, flag(1), flag(0))(false, '1');
    });

    bench('31 占位符', () => {
      placeholderFuncWithSort(f)(flag(1), '1', flag(0))(false, 1);
    });

    bench('全占位符', () => {
      placeholderFuncWithSort(f)(flag(0), flag(1), flag(2))(1, '1', false);
    });

    bench('全占位符 213', () => {
      placeholderFuncWithSort(f)(flag(1), flag(0), flag(2))('1', 1, false);
    });
  });
});

test('类型检查', async () => {
  const { placeholderFuncWithSort } = await loadModule();
  const { flag } = placeholderFuncWithSort;

  type Test = { __: never };
  const testArg: Test = { __: null as never };

  const f = (a: number, b: string, c: boolean, d: Test) => a + b + c + d;

  const func1 = placeholderFuncWithSort(f)(1, '1', flag(0), testArg);
  assertType<KEqual<typeof func1, (a: boolean) => string>>(true);
  const func2 = placeholderFuncWithSort(f)(1, '1', false, testArg);
  assertType<KEqual<typeof func2, () => string>>(true);
  const func3 = placeholderFuncWithSort(f)(1, flag(2), flag(0), flag(1));
  assertType<KEqual<typeof func3, (a: boolean, b: Test, c: string) => string>>(true);
  const func4 = placeholderFuncWithSort(f)(flag(2), flag(0), flag(1), testArg);
  assertType<KEqual<typeof func4, (a: string, b: boolean, c: number) => string>>(true);
  const func5 = placeholderFuncWithSort(f)(flag(1), flag(2), flag(0), testArg);
  assertType<KEqual<typeof func5, (a: boolean, b: number, c: string) => string>>(true);
});
