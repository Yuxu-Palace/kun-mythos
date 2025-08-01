import { describe, expect, test } from 'vitest';
import { bench, MFT } from '../utils';

MFT(
  (
    { cacheFn, clearFnCache, retryCacheFn, debounceCacheFn, cacheFnFromGetter, cacheGetterResult, sleep, sleepSync },
    { format, IS_BENCH },
  ) => {
    test('导出检查', () => {
      expect(typeof cacheFn).toBe('function');
      expect(typeof clearFnCache).toBe('function');
      expect(typeof retryCacheFn).toBe('function');
      expect(typeof debounceCacheFn).toBe('function');
      expect(typeof cacheFnFromGetter).toBe('function');
    });

    const add = (a: number, b: number) => ({ result: a + b });

    test('基本使用', () => {
      const cf1 = cacheFn(add);
      const cf1r = cf1(1, 2);
      expect(cf1r).toEqual({ result: 3 });
      expect(cf1(1, 2)).toBe(cf1r);
      expect(cf1(1, 3)).toBe(cf1r);

      const cf2 = cacheFn(add);
      const cf2r = cf2(1, 2);
      expect(cf2r).toEqual({ result: 3 });
      expect(cf2(1, 2)).toBe(cf2r);
      expect(cf2(1, 3)).toBe(cf2r);

      expect(cf1).not.toBe(cf2);

      expect(clearFnCache(cf1)).toBe(true);
      expect(cf1(1, 2)).not.toBe(cf1r);

      expect(cf2.clearCache()).toBe(true);
      expect(cf2(1, 2)).not.toBe(cf2r);
    });

    test('retryCacheFn 基本使用', () => {
      const rcf1 = retryCacheFn((...args: Parameters<typeof add>) => {
        const result = add(...args);
        if (result.result === 3) {
          return null;
        }
        return result;
      });

      expect(rcf1(1, 2)).toBeNull();
      const result = rcf1(1, 3);
      expect(result).toEqual({ result: 4 });
      expect(rcf1(1, 4)).toEqual(result);
      expect(rcf1.clearCache()).toBe(true);
      expect(rcf1(1, 2)).toBeNull();
      expect(rcf1(1, 4)).toEqual({ result: 5 });
    });

    test('debounceCacheFn 基本使用', async () => {
      const dcf1 = debounceCacheFn((...args: Parameters<typeof add>) => {
        const result = add(...args);
        if (result.result === 3) {
          return null;
        }
        return result;
      }, 10);

      expect(dcf1(1, 2)).toBeNull();
      expect(dcf1(1, 3)).toBeNull();
      await sleep(10);
      const dcf1r1 = dcf1(1, 3);
      expect(dcf1r1).toEqual({ result: 4 });
      expect(dcf1(1, 2)).toBe(dcf1r1);
      expect(dcf1.clearCache()).toBe(true);
      expect(dcf1(1, 2)).toBeNull();
      expect(dcf1(1, 4)).toBeNull();
    });

    test('cacheFnFromGetter 基本使用', async () => {
      let flag = 0;
      const cf1 = cacheFnFromGetter((): ((a: number) => number) => {
        if (flag) {
          return (a) => a + 1;
        }
        return (a) => a + 2;
      });

      expect(cf1(1)).toBe(3);
      flag = 1;
      expect(cf1(2)).toBe(3);
      expect(cf1.clearCache()).toBe(true);
      expect(cf1(1)).toBe(3);
      expect(cf1(2)).toBe(3);

      flag = 0;

      // clearTopCache test
      const cf2 = cacheFnFromGetter((): ((a: number) => number) => {
        if (flag) {
          return (a) => a + 1;
        }
        return (a) => a + 2;
      }, true);

      expect(cf2(1)).toBe(3);
      flag = 1;
      expect(cf2(2)).toBe(3);
      expect(cf2.clearCache()).toBe(true);
      expect(cf2(1)).toBe(2);
      expect(cf2(2)).toBe(2);
    });

    test('cacheGetterResult 基本使用', async () => {
      let flag = 0;

      const cf1 = cacheGetterResult((): ((a: number) => number) => {
        if (flag) {
          return (a) => a + 1;
        }
        return (a) => a + 2;
      });

      expect(cf1(1)).toBe(3);
      flag = 1;
      expect(cf1(2)).toBe(4);
      expect(cf1.clearCache()).toBe(true);
      expect(cf1(1)).toBe(2);
      expect(cf1(2)).toBe(3);

      flag = 0;

      const cf2 = cacheGetterResult(() => {
        if (flag) {
          return (a: number) => a + 1;
        }
        return '2';
      });

      expect(cf2(1)).toBe('2');
      flag = 1;
      expect(cf2(2)).toBe('2');
      cf2.clearCache();
      expect(cf2(1)).toBe(2);
      expect(cf2(2)).toBe(3);
    });

    test('边界情况', () => {
      // @ts-expect-error test
      expect(() => cacheFn()).toThrowError(TypeError);
      // @ts-expect-error test
      expect(() => cacheFn('')).toThrowError(TypeError);
      // @ts-expect-error test
      expect(() => clearFnCache()).toThrowError(TypeError);
      // @ts-expect-error test
      expect(() => clearFnCache('')).toThrowError(TypeError);
      // @ts-expect-error test
      expect(() => retryCacheFn('')).toThrowError(TypeError);
      // @ts-expect-error test
      expect(() => debounceCacheFn('')).toThrowError(TypeError);
      // @ts-expect-error test
      expect(() => cacheFnFromGetter('')).toThrowError(TypeError);
      // @ts-expect-error test
      expect(() => cacheFnFromGetter(() => '')()).toThrowError(TypeError);
      // @ts-expect-error test
      expect(() => cacheGetterResult('')).toThrowError(TypeError);
      expect(clearFnCache(() => {})).toBe(false);
    });

    describe.runIf(IS_BENCH)(`${format} 性能测试`, () => {
      const add = (a: number, b: number) => {
        // 模拟长任务
        sleepSync(1);
        return a + b;
      };
      const cf1 = cacheFn(add);

      bench(
        'noCache',
        () => {
          add(1, 2);
        },
        { iterations: 1 },
      );

      bench('cacheFn', () => {
        cf1(1, 2);
      });
    });
  },
);
