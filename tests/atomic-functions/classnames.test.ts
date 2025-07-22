import { expect, test } from 'vitest';
import { MFT } from '../utils';

MFT(({ classnames, cn }) => {
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
    ).toBe('a b d true c d e f 1 g 1 true 123');
  });

  test('边界情况', () => {
    // 空 keys
    expect(cn([])).toBe('');
    // 没传递任何参数
    expect(cn()).toBe('');
    // 对象为 null
    // @ts-expect-error test
    expect(cn(null, [])).toBe('');
    // 对象为 null 且没传递 keys
    // @ts-expect-error test
    expect(cn(null)).toBe('');
    // 对象为 undefined
    // @ts-expect-error test
    expect(cn(undefined)).toBe('');
    // 对象为 Symbol
    // @ts-expect-error test
    expect(cn(Symbol('test'))).toMatchInlineSnapshot(`"Symbol(test)"`);
    // 对象为 Symbol.for
    // @ts-expect-error test
    expect(cn(Symbol.for('test'))).toMatchInlineSnapshot(`"Symbol(test)"`);
    // 空对象
    expect(cn({})).toBe('');
  });
});
