import { assertType, describe, expect, test } from 'vitest';
import { bench, loadModule, MFT } from '../utils';

MFT(({ curry, placeholderFunc, __ }, { format, IS_BENCH }) => {
  test('导出检查', () => {
    expect(typeof curry).toBe('function');
  });

  test('基本使用', () => {
    const add = (a: number, b: number, c: number, d: number, e: number) => a + b + c + d + e;
    const curriedAdd = curry(add);

    expect(curriedAdd(1)(2)(3)(4)(5)).toBe(15);
    expect(curriedAdd(1, 2)(3, 4)(5)).toBe(15);
    expect(curriedAdd(1, 2, 3)(4, 5)).toBe(15);
    expect(curriedAdd(1, 2, 3, 4, 5)).toBe(15);
    expect(curriedAdd(1, 2, 3, 4)(5)).toBe(15);
    expect(curriedAdd(1, 2, 3)(4)(5)).toBe(15);
    expect(curriedAdd(1, 2)(3)(4, 5)).toBe(15);
    // @ts-expect-error 异常类型参数, curry 不处理参数类型, 只对逻辑做处理
    expect(curriedAdd(1)(2)('3')(4)(5)).toBe('3345');
  });

  test('装饰器用法', () => {
    class Test {
      static num = 10;

      @curry
      static add(a: number, b: number, c: number, d: number, e: number) {
        return a + b + c + d + e + Test.num;
      }

      sum = 20;

      @curry
      add(a: number, b: number, c: number, d: number, e: number) {
        return a + b + c + d + e + Test.num + this.sum;
      }
    }

    // @ts-expect-error 可用但是类型提示会报错
    expect(Test.add(1, 2, 3)(4, 5)).toBe(25);
    // @ts-expect-error 可用但是类型提示会报错
    expect(new Test().add(1, 2, 3)(4, 5)).toBe(45);
  });

  test('边界情况', () => {
    // 空参数
    // @ts-expect-error
    expect(() => curry()).toThrowError(TypeError);
    // 函数为 null
    // @ts-expect-error
    expect(() => curry(null)).toThrowError(TypeError);
    // 函数为 undefined
    // @ts-expect-error
    expect(() => curry(undefined)).toThrowError(TypeError);
    // 形参列表为空
    expect(() => curry(() => {})).toThrowError(TypeError);
    // 形参为扩展参数
    expect(() => curry((..._: any[]) => {})).toThrowError(TypeError);
    // 形参为可选参数
    expect(typeof curry((_?: any) => {})).toBe('function');
    // 形参为默认参数
    expect(() => curry((_ = 1) => {})).toThrowError(TypeError);
  });

  describe.runIf(IS_BENCH)(`${format}性能测试`, () => {
    const add = (a: number, b: number, c: number, d: number, e: number) => a + b + c + d + e;
    const curriedAdd = curry(add);

    bench('curry 化前性能', () => {
      add(1, 2, 3, 4, 5);
    });

    bench('curry 化后性能, 单参', () => {
      curriedAdd(1)(2)(3)(4)(5);
    });

    bench('curry 化后性能, 完整参数', () => {
      curriedAdd(1, 2, 3, 4, 5);
    });

    bench(
      'curry 化前性能, 预热',
      () => {
        add(1, 2, 3, 4, 5);
      },
      { warmupTime: 200 },
    );

    bench(
      'curry 化后性能, 预热, 单参',
      () => {
        curriedAdd(1)(2)(3)(4)(5);
      },
      { warmupTime: 200 },
    );

    bench(
      'curry 化后性能, 预热, 完整参数',
      () => {
        curriedAdd(1, 2, 3, 4, 5);
      },
      { warmupTime: 200 },
    );

    const placeCurryAdd = curry(placeholderFunc(add)(__, __, 3, 4, 5));

    bench('curry placeholderFunc 化后性能, 单参', () => {
      placeCurryAdd(1)(2);
    });

    bench('curry placeholderFunc 化后性能, 完整参数', () => {
      placeCurryAdd(1, 2);
    });

    bench(
      'curry placeholderFunc 化后性能, 预热, 单参',
      () => {
        placeCurryAdd(1)(2);
      },
      { warmupTime: 200 },
    );

    bench(
      'curry placeholderFunc 化后性能, 预热, 完整参数',
      () => {
        placeCurryAdd(1, 2);
      },
      { warmupTime: 200 },
    );
  });
});

test('类型测试', async () => {
  const { curry, placeholderFunc, __ } = await loadModule();

  assertType<(a: number, b: number) => number>(curry((a: number, b: number) => a + b));
  assertType<(a: number) => (b: number) => number>(curry((a: number, b: number) => a + b));
  assertType<(a: number, b: string) => number>(curry((a: number, b: string) => a + Number(b)));
  assertType<(a: number) => (b: string) => string>(curry((a: number, b: string) => a + b));
  assertType<(a: number) => (b: string) => number>(curry((a?: number, b?: string) => a || 1 + Number(b)));

  assertType<(a: number, b: string) => string>(curry(placeholderFunc((a: number, b: string) => a + b)(__, __)));
  assertType<(a: number) => (b: string) => string>(curry(placeholderFunc((a: number, b: string) => a + b)(__, __)));
  assertType<(a: number) => string>(curry(placeholderFunc((a: number, b: string) => a + b)(__, '1')));

  assertType<(a: number) => string>(curry(placeholderFunc((a: number, b: string) => a + b))(__)('1'));
  assertType<(a: number, b: string) => string>(curry(placeholderFunc((a: number, b: string) => a + b))(__)(__));
});
