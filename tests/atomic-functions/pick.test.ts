import { assertType, bench, describe, expect, test } from 'vitest';
import { loadModule, MFT } from '../utils';

MFT(({ pick }, { format, IS_BENCH }) => {
  test('导出检查', () => {
    expect(typeof pick).toBe('function');
  });

  test('基本用法', () => {
    expect(pick({ a: 1, b: 2, c: 3 }, ['a', 'c'])).toEqual({ a: 1, c: 3 });
    // 读取不存在的属性
    expect(pick({ a: 1, b: 2, c: 3 }, ['a', 'd'])).toEqual({ a: 1, d: undefined });
    // 读取嵌套对象
    const innerObj = {};
    const readInnerObjresult = pick({ a: 1, innerObj }, ['a', 'innerObj']);
    expect(readInnerObjresult).toEqual({ a: 1, innerObj });
    expect(readInnerObjresult.innerObj).toBe(innerObj);
  });

  test('边界情况', () => {
    // 空 keys
    expect(pick({}, [])).toEqual({});
    // 没传递 keys
    // @ts-expect-error test
    expect(pick({})).toEqual({});
    // 非数组 key
    // @ts-expect-error test
    expect(pick({}, 1)).toEqual({});
    // 对象为 null
    // @ts-expect-error test
    expect(pick(null, [])).toEqual({});
    // 对象为 null 且没传递 keys
    // @ts-expect-error test
    expect(pick(null)).toEqual({});
    // 没传递任何参数
    // @ts-expect-error test
    expect(pick()).toEqual({});
  });

  test('扩展测试场景', async () => {
    // 测试数组对象
    expect(pick([1, 2, 3], ['0', '2'])).toEqual({ '0': 1, '2': 3 });

    // 测试symbol键
    const sym = Symbol('test');
    const obj = { [sym]: 'value', a: 1 };
    expect(pick(obj, [sym, 'a'])).toEqual({ [sym]: 'value', a: 1 });
  });

  if (!IS_BENCH) return;

  describe(`${format}性能测试`, () => {
    bench(
      '全量读取',
      async () => {
        const obj = { a: 1, b: 2, c: 3, d: 4, e: 5, f: 6, g: 7, h: 8, i: 9, j: 10 };
        pick(obj, Object.keys(obj));
      },
      { iterations: 1000 },
    );
  });
});

test('类型测试', async () => {
  const { pick } = await loadModule();
  assertType<{ a: number; c: number }>(pick({ a: 1, b: 2, c: 3 }, ['a', 'c']));
  assertType<{ a: number; notFound: undefined }>(pick({ a: 1, b: 2, c: 3 }, ['a', 'notFound']));
});
