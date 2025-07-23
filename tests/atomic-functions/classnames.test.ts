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
    expect(cn(Symbol('test'))).toMatch(/^Symbol\(test\)$/);
    // 对象为 Symbol.for
    expect(cn(Symbol.for('test'))).toMatch(/^Symbol\(test\)$/);
    // 空对象, error 也会被当成对象然后遍历 key 进行处理
    expect(cn({}, new Error())).toBe('');
  });
});
