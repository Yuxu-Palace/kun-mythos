import { assertType, describe, expect, test } from 'vitest';
import { bench, loadModule, MFT } from '../utils';

MFT(({ placeholderFunc, __, PLACEHOLDER_FLAG }, { format, IS_BENCH }) => {
  test('导出检查', () => {
    expect(placeholderFunc.__).toBe(__);
    expect(placeholderFunc.__).toBe(PLACEHOLDER_FLAG);
    expect(PLACEHOLDER_FLAG).toBe(__);
    expect(typeof placeholderFunc).toBe('function');
    expect(typeof __).toBe('symbol');
  });

  test('基本使用', () => {
    expect(placeholderFunc((a: string, b: string) => a + b)(__, '1')('2')).toBe('21');
    expect(placeholderFunc((a: string, b: string) => a + b)('1', __)('2')).toBe('12');
    // @ts-expect-error 异常类型参数, placeholderFunc 不处理参数类型, 只对逻辑做处理
    expect(placeholderFunc((a: string, b: string) => a + b)(1, __)(2)).toBe(3);
    expect(placeholderFunc((a: string, b: string) => a + b)('1', '2')()).toBe('12');
  });

  test('边界情况', () => {
    // 无参数
    // @ts-expect-error
    expect(() => placeholderFunc()).toThrowError(TypeError);
    // 参数为 null
    // @ts-expect-error
    expect(() => placeholderFunc(null)).toThrowError(TypeError);
    // 参数为 undefined
    // @ts-expect-error
    expect(() => placeholderFunc(undefined)).toThrowError(TypeError);
    // 参数为 Symbol
    // @ts-expect-error
    expect(() => placeholderFunc(Symbol('test'))).toThrowError(TypeError);
    // 参数长度不匹配
    // @ts-expect-error
    expect(() => placeholderFunc((a: number, b: number) => a + b)(__, 1)()).toThrowError(TypeError);
    expect(placeholderFunc((...args) => args).length).toBe(0);
  });

  describe.runIf(IS_BENCH)(`${format}性能测试`, () => {
    const f = (a: number, b: string, c: boolean) => a + b + c;

    bench('原函数', () => {
      f(1, '1', false);
    });

    bench('末尾占位符', () => {
      placeholderFunc(f)(1, '1', __)(false);
    });

    bench('中间占位符', () => {
      placeholderFunc(f)(1, __, false)('1');
    });

    bench('开头占位符', () => {
      placeholderFunc(f)(__, '1', false)(1);
    });

    bench('无占位符', () => {
      placeholderFunc(f)(1, '1', false)();
    });

    bench('12 占位符', () => {
      placeholderFunc(f)(__, __, true)(1, '1');
    });

    bench('23 占位符', () => {
      placeholderFunc(f)(1, __, __)('1', false);
    });

    bench('13 占位符', () => {
      placeholderFunc(f)(__, '1', __)(1, false);
    });

    bench('全占位符', () => {
      placeholderFunc(f)(__, __, __)(1, '1', false);
    });
  });
});

test('类型检查', async () => {
  const { placeholderFunc, __ } = await loadModule();

  assertType<(a: number, b: boolean) => string>(
    placeholderFunc((a: number, b: string, c: boolean) => a + b + c)(__, '1', __),
  );
  assertType<(a: string, b: boolean) => string>(
    placeholderFunc((a: number, b: string, c: boolean) => a + b + c)(1, __, __),
  );
  assertType<(b: boolean) => string>(placeholderFunc((a: number, b: string, c: boolean) => a + b + c)(1, '1', __));
  assertType<() => string>(placeholderFunc((a: number, b: string, c: boolean) => a + b + c)(1, '1', false));
});
