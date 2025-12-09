import { describe, expect, test } from 'vitest';
import { bench, MFT } from '../utils';

MFT(({ classnames, cn }, { format, IS_BENCH }) => {
  test('导出检查', () => {
    expect(classnames).toBe(cn);
    expect(typeof classnames).toBe('function');
  });

  test('基本使用', () => {
    expect(cn('a', 'b', 'c')).toBe('a b c');
    expect(cn(['a', 'b', 'c'])).toBe('a b c');
    expect(cn([{ a: true, b: false }, { c: true }])).toBe('a c');
    expect(cn({ a: true, b: false }, { c: true })).toBe('a c');
    expect(cn([{ a: true }, 'b'], ['c'])).toBe('a b c');
    expect(
      cn(
        [{ a: true }, 'b', { d: 1 }, [true]],
        { c: true },
        ['d', { e: true }, false, ['f', 1, ['', { g: true }, [1, 'true']]]],
        '123',
      ),
    ).toBe('a b d true c e f 1 g true 123');
  });

  test('循环依赖', () => {
    const obj: Record<string, any> = { a: true, b: false, c: true };
    obj.d = obj;
    expect(cn(obj)).toBe('a c d');
    const arr: any[] = [1, 2, 3];
    arr.push(arr, obj, arr);
    expect(cn(arr)).toBe('1 2 3 a c d');
  });

  test('边界情况', () => {
    // 空 keys
    expect(cn([])).toBe('');
    // 没传递任何参数
    expect(cn()).toBe('');
    // 对象为 null
    expect(cn(null, [])).toBe('');
    // 对象为 null 且没传递 keys
    expect(cn(null)).toBe('');
    // 对象为 undefined
    expect(cn(undefined)).toBe('');
    // 对象为 Symbol
    // @ts-expect-error test
    expect(cn(Symbol('test'))).toBe('');
    // 对象为 Symbol.for
    // @ts-expect-error test
    expect(cn(Symbol.for('test'))).toBe('');
    // @ts-expect-error test
    expect(cn({ [Symbol('test')]: true, c: Symbol('test') }, Symbol('test'))).toBe('c');
    // 空对象, error 也会被当成对象然后遍历 key 进行处理
    expect(cn({}, new Error('test'))).toBe('');
  });

  describe.runIf(IS_BENCH)(`${format}性能测试`, () => {
    bench('覆盖所有分支', () => {
      cn(
        [{ a: true }, 'b', { d: 1 }, [true]],
        { c: true },
        ['d', { e: true }, false, ['f', 1, ['', { g: true }, [1, 'true']]]],
        '123',
        [Symbol('test'), Symbol.for('test')],
        { [Symbol('test')]: true, c: Symbol('test'), [Symbol.for('test')]: !1 },
        new Error('test error'),
        [!1 && '213', !0 && '321', Symbol.for('test') && '123'],
      );
    });

    bench('边界空跑', () => {
      cn();
      cn([]);
      cn({});
      cn(null);
      cn(undefined);
    });

    bench('纯字符串测试', () => {
      cn('1', '2', '3', '4', '5', '6', '7', '8', '9', '10');
    });

    bench(
      '纯字符串测试, 预热',
      () => {
        cn('1', '2', '3', '4', '5', '6', '7', '8', '9', '10');
      },
      { warmupTime: 200 },
    );

    bench('纯数组测试', () => {
      cn(['1'], ['2', '3'], ['4', '5', '6'], ['7', '8', '9', '10']);
    });

    bench(
      '纯数组测试, 预热',
      () => {
        cn(['1'], ['2', '3'], ['4', '5', '6'], ['7', '8', '9', '10']);
      },
      { warmupTime: 200 },
    );
  });
});
