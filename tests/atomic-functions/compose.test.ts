import { assertType, expect, test } from 'vitest';
import { loadModule, MFT } from '../utils';

MFT(({ compose }) => {
  test('导出检查', () => {
    expect(typeof compose).toBe('function');
  });

  test('基本使用', () => {
    // 单个函数测试
    expect(
      compose(
        (a: number) => a + 1,
        () => 1,
      )(),
    ).toBe(2);

    // 多个函数测试，从右到左执行
    expect(
      compose(
        (c: string) => `Result: ${c}`,
        (b: number) => b.toString(),
        (a: number) => a + 1,
      )(1),
    ).toBe('Result: 2');

    // 测试多参数函数
    expect(
      compose(
        (c: string) => `Result: ${c}`,
        (b: number) => b.toString(),
        (a: number, b: number) => a + b,
      )(1, 2),
    ).toBe('Result: 3');

    // 测试函数执行顺序（从右到左）
    const order: number[] = [];
    compose(
      () => {
        order.push(1);
        return 1;
      },
      () => {
        order.push(2);
        return 2;
      },
      () => {
        order.push(3);
        return 3;
      },
    )();
    expect(order).toEqual([3, 2, 1]);
  });

  test('边界情况', () => {
    // 非函数参数测试
    // @ts-expect-error test
    expect(() => compose(() => {}, null)).toThrowError(TypeError);

    // 测试数组参数传递
    expect(
      compose(
        (c: string) => `Result: ${c}`,
        (b: number[]) => b.toString(),
        (a: number, b: number) => [a, b],
      )(1, 2),
    ).toBe('Result: 1,2');

    // 测试this上下文传递
    const obj = { value: 10 };
    const result = compose(
      function (this: typeof obj, x: number) {
        return this.value + x;
      },
      function (this: typeof obj) {
        return this.value;
      },
    ).call(obj);
    expect(result).toBe(20);
  });
});

test('类型检查', async () => {
  const { compose } = await loadModule();

  // @ts-expect-error 至少需要一个参数
  assertType(compose());

  // 单个函数测试
  assertType<() => number>(compose(() => 1));

  // 参数类型不匹配测试
  assertType<(a: number) => number>(
    compose(
      (_: number) => 1,
      // @ts-expect-error 参数类型不匹配, 所以这个函数之后的类型均不检查
      (_: string) => (1).toString(),
      (num: number) => num,
    ),
  );

  // 多参数函数测试
  assertType<(a: number, b: string) => string>(
    compose(
      (a: number) => `Result: ${a}`,
      (a: number) => a + 1,
      (a: number, b: string) => a + Number(b),
    ),
  );

  // 函数不接收参数但获取到一个参数
  // @ts-expect-error 函数不接收参数但是获取到一个
  assertType(compose(() => 1)(1));

  // 参数类型错误测试
  assertType(
    compose(
      // @ts-expect-error 参数类型错误 只接受一个 number[] 参数
      (a: number, b: number) => a + b,
      () => [1, 2],
    )(),
  );

  // 测试从右到左的类型推导
  assertType<(x: string) => number>(
    compose(
      (x: boolean) => (x ? 1 : 0),
      (x: string) => x.length > 5,
    ),
  );

  // 测试复杂的类型推导
  assertType<(x: string, y: number) => readonly [string, boolean]>(
    compose(
      (x: readonly [string, boolean]) => x,
      (x: readonly [number, string]) => [x[1], x[0] > 10] as const,
      (x: string, y: number) => [y, x] as const,
    ),
  );
});
