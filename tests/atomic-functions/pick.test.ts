import { assertType, expect, test } from 'vitest';
import { loadModule, MFT } from '../utils';

MFT(({ pick }) => {
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
});

test('类型测试', async () => {
  const { pick } = await loadModule();
  assertType<{ a: number; c: number }>(pick({ a: 1, b: 2, c: 3 }, ['a', 'c']));
  assertType<{ a: number; notFound: undefined }>(pick({ a: 1, b: 2, c: 3 }, ['a', 'notFound']));
});
