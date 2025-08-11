import { assertType, describe, expect, test } from 'vitest';
import type { KEqual } from '@/index';
import { loadModule, MFT } from '../utils';

MFT(({ tryCall, tryCallFunc }) => {
  test('导出检查', () => {
    expect(typeof tryCall).toBe('function');
    expect(typeof tryCallFunc).toBe('function');
  });

  test('tryCall 基本使用', async () => {
    expect(tryCall(() => 1)).toBe(1);
    expect(await tryCall(async () => 1)).toBe(1);
    expect(() =>
      tryCall(() => {
        throw new Error('error');
      }),
    ).toThrowError(Error);
    expect(
      tryCall(
        () => {
          throw new Error('error');
        },
        () => 2,
      ),
    ).toBe(2);
    expect(
      await tryCall(
        async () => {
          throw new Error('error');
        },
        () => 3,
      ),
    ).toBe(3);
    expect(async () => {
      await tryCall(async () => {
        throw new Error('error');
      });
    }).rejects.toThrowError(Error);
  });

  test('tryCallFunc 基本使用', async () => {
    const fn = tryCallFunc(() => 1);
    expect(fn()).toBe(1);
    expect(fn()).toBe(1);
    const fn2 = tryCallFunc(async () => 1);
    expect(await fn2()).toBe(1);
    const fn3 = tryCallFunc(
      () => {
        throw new Error('error');
      },
      () => 2,
    );
    expect(fn3()).toBe(2);
    const fn4 = tryCallFunc(
      async () => {
        throw new Error('error');
      },
      () => 3,
    );
    expect(await fn4()).toBe(3);
    const fn5 = tryCallFunc(async () => {
      throw new Error('error');
    });
    expect(() => fn5()).rejects.toThrowError(Error);
    const fn6 = tryCallFunc(() => {
      throw new Error('error');
    });
    expect(() => fn6()).toThrowError(Error);
    const fn_ = tryCallFunc((a: number, b: number) => {
      if (a % b) {
        throw new Error('error');
      }
      return a / b;
    });
    expect(fn_(1, 1)).toBe(1);
    expect(fn_(1, 0)).toBe(Infinity);
    expect(() => fn_(1, 2)).toThrowError(Error);
  });

  test('边缘情况', () => {
    // @ts-expect-error test
    expect(() => tryCall(undefined)).toThrowError(TypeError);
    // @ts-expect-error test
    expect(() => tryCallFunc(undefined)).toThrowError(TypeError);
  });
});

describe('类型测试', async () => {
  const { tryCall, tryCallFunc } = await loadModule();

  test('tryCall 类型测试', () => {
    const result = tryCall(() => 1);
    assertType<KEqual<typeof result, number | undefined>>(true);

    assertType<number | string>(
      tryCall(
        () => 1,
        () => '2',
      ),
    );

    const result2 = tryCall(async () => 1);
    assertType<KEqual<typeof result2, Promise<number>>>(true);

    const result3 = tryCall(
      async () => 1,
      async () => '1',
    );
    assertType<KEqual<typeof result3, Promise<number> | Promise<string>>>(true);
  });

  test('tryCallFunc 类型测试', () => {
    const result = tryCallFunc(() => 1);
    assertType<KEqual<typeof result, () => number | undefined>>(true);
    const result2 = tryCallFunc(async () => 1);
    assertType<KEqual<typeof result2, () => Promise<number>>>(true);
    const result3 = tryCallFunc(
      () => {
        if (Math.random()) {
          return '1';
        }
        throw new Error('error');
      },
      () => 2,
    );
    assertType<KEqual<typeof result3, () => number | string>>(true);
    const result4 = tryCallFunc(
      async () => {
        if (Math.random()) {
          return '1';
        }
        throw new Error('error');
      },
      async () => 2,
    );
    assertType<KEqual<typeof result4, () => Promise<number> | Promise<string>>>(true);
  });
});
