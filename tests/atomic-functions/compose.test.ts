import { assertType, expect, test } from 'vitest';
import { loadModule, MFT } from '../utils';

MFT(({ compose }) => {
  test('导出检查', () => {
    expect(typeof compose).toBe('function');
  });

  test('基本使用', () => {
    expect(
      compose(
        () => 1,
        (a: number) => a + 1,
      )(),
    ).toBe(2);
    expect(
      compose(
        (a: number) => a + 1,
        (b: number) => b.toString(),
        (c: string) => `Result: ${c}`,
      )(1),
    ).toBe('Result: 2');
    expect(
      compose(
        (a: number, b: number) => a + b,
        (b: number) => b.toString(),
        (c: string) => `Result: ${c}`,
      )(1, 2),
    ).toBe('Result: 3');
    expect(
      compose(
        (a: number, b: number) => a + b,
        (b: number) => b.toString(),
        (c: string) => `Result: ${c}`,
      )(1, 2),
    ).toBe('Result: 3');
  });

  test('边界情况', () => {
    // @ts-expect-error test
    expect(() => compose(() => {}, null)).toThrowError(TypeError);
    expect(
      compose(
        (a: number, b: number) => [a, b],
        // @ts-expect-error test
        (b: number) => b.toString(),
        (c: string) => `Result: ${c}`,
      )(1, 2),
    ).toBe('Result: 1,2');
  });
});

test('类型检查', async () => {
  const { compose } = await loadModule();

  // @ts-expect-error 至少需要一个参数
  assertType(compose());
  assertType<() => number>(compose(() => 1));
  assertType<(a: number) => number>(
    compose(
      (_: number) => 1,
      // @ts-expect-error 参数类型不匹配, 所以这个函数之后的类型均不检查
      (_: string) => (1).toString(),
      (num: number) => num,
    ),
  );
  assertType<(a: number, b: string) => string>(
    compose(
      (a: number, b: string) => a + Number(b),
      (a: number) => a + 1,
      (a: number) => `Result: ${a}`,
    ),
  );
  // @ts-expect-error 函数不接收参数但是获取到一个
  assertType(compose(() => 1)(1));
  assertType(
    compose(
      () => [1, 2],
      // @ts-expect-error 参数类型错误 只接受一个 number[] 参数
      (a: number, b: number) => a + b,
    )(),
  );
});
