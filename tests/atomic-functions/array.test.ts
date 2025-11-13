import { assertType, expect, test } from 'vitest';
import { loadModule, MFT } from '../utils';

MFT(({ isNonEmptyArray }) => {
  test('基本使用', () => {
    expect(isNonEmptyArray([1])).toBe(true);
    expect(isNonEmptyArray(['a', 'b', 'c'])).toBe(true);
    expect(isNonEmptyArray([])).toBe(false);
  });

  test('非数组或空输入', () => {
    expect(isNonEmptyArray(null)).toBe(false);
    expect(isNonEmptyArray(undefined)).toBe(false);
    expect(isNonEmptyArray('not array')).toBe(false);
    expect(isNonEmptyArray(123)).toBe(false);
    expect(isNonEmptyArray({ length: 1 })).toBe(false);
  });

  test('类型守卫行为', () => {
    const maybeNumbers: number[] | undefined = Math.random() > 0.5 ? [1, 2, 3] : undefined;

    if (isNonEmptyArray(maybeNumbers)) {
      assertType<number[]>(maybeNumbers);
      expect(maybeNumbers.length).toBeGreaterThan(0);
    } else {
      assertType<undefined>(maybeNumbers);
      expect(maybeNumbers).toBeUndefined();
    }
  });
});

test('类型测试', async () => {
  const { isNonEmptyArray } = await loadModule();

  const maybeStrings: string[] | undefined = Math.random() > 0.5 ? ['foo'] : undefined;

  if (isNonEmptyArray(maybeStrings)) {
    assertType<string[]>(maybeStrings);
  } else {
    assertType<undefined>(maybeStrings);
  }

  const mixedTuple: Array<string | number> | [] = Math.random() > 0.5 ? ['foo', 1] : [];

  if (isNonEmptyArray(mixedTuple)) {
    assertType<Array<string | number>>(mixedTuple);
  } else {
    assertType<[]>(mixedTuple);
  }
});
