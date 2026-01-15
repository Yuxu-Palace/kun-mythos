import { expect, test } from 'vitest';
import { MFT } from '../utils';

MFT(({ pickRename }) => {
  test('导出检查', () => {
    expect(typeof pickRename).toBe('function');
  });

  test('基本使用', () => {
    const testObj = {
      array: [1, 2, 3],
      obj: { a: 1, b: 2 },
      voKey: 0,
      deepObj: {
        dto_key: 123,
        deepObj2: { voKey: 123 },
      },
    };

    expect(
      pickRename(['array:arr', 'obj:object', 'deepObj.dto_key:voKey', 'deepObj.deepObj2.voKey:.dto_key'], testObj),
    ).toEqual({
      arr: [1, 2, 3],
      object: { a: 1, b: 2 },
      voKey: 123,
      deepObj: {
        deepObj2: { dto_key: 123 },
      },
    });

    expect(
      pickRename(
        {
          array: 'arr',
          obj: 'object',
          'deepObj.dto_key': 'voKey',
          'deepObj.deepObj2.voKey': '.dto_key',
        },
        testObj,
      ),
    ).toEqual({
      arr: [1, 2, 3],
      object: { a: 1, b: 2 },
      voKey: 123,
      deepObj: {
        deepObj2: { dto_key: 123 },
      },
    });

    // expect(
    //   pickRename(
    //     {
    //       array: 'arr',
    //       obj: 'object',
    //       deepObj: {
    //         dto_key: 'voKey',
    //         deepObj2: { voKey: '.dto_key' },
    //       },
    //     },
    //     testObj,
    //   ),
    // ).toEqual({
    //   arr: [1, 2, 3],
    //   object: { a: 1, b: 2 },
    //   voKey: 123,
    //   deepObj: {
    //     deepObj2: { dto_key: 123 },
    //   },
    // });

    expect(
      pickRename(['array:arr', 'obj:object', 'deepObj.dto_key:voKey', 'deepObj.deepObj2.voKey:.dto_key'], testObj, {
        mode: 'merge',
      }),
    ).toEqual({
      array: [1, 2, 3],
      arr: [1, 2, 3],
      obj: { a: 1, b: 2 },
      object: { a: 1, b: 2 },
      voKey: 123,
      deepObj: {
        dto_key: 123,
        deepObj2: { voKey: 123, dto_key: 123 },
      },
    });

    expect(pickRename(['a:.b'], { a: 1 }, { mode: 'merge' })).toEqual({ a: 1, b: 1 });
    expect(pickRename(['a:.b'], { a: 1 }, { mode: 'pick' })).toEqual({ b: 1 });
    expect(pickRename(['a.b.c:.d'], {})).toEqual({ a: { b: { d: undefined } } });
    expect(pickRename(['a.b.c:d'], {})).toEqual({ d: undefined });
    expect(pickRename(['a.b.c:.'], {})).toEqual({ a: { b: { c: undefined } } });
  });

  test('数组 keyPath 使用', () => {
    expect(pickRename([[['a', 0], 'b']], { a: [1] })).toEqual({ b: 1 });
    expect(
      pickRename(
        [
          [
            ['a', 0],
            ['b', '0'],
          ],
        ],
        { a: [1] },
      ),
    ).toEqual({ b: { 0: 1 } });
    expect(
      pickRename(
        [
          [
            ['a', 0],
            ['.', '1'],
          ],
        ],
        { a: [1] },
      ),
    ).toEqual({ a: { 1: 1 } });
    expect(pickRename([['a.0', ['.']]], { a: [1] })).toEqual({ a: { 0: 1 } });
    expect(pickRename([['a.0', '.']], { a: [1] })).toEqual({ a: { 0: 1 } });

    const testKey = Symbol('test');
    expect(pickRename([[['a', testKey], '.']], { a: { [testKey]: 1 } })).toEqual({ a: { [testKey]: 1 } });
    expect(pickRename([[['a', testKey], '.b']], { a: { [testKey]: 1 } })).toEqual({ a: { b: 1 } });

    expect(
      pickRename(
        [
          [
            ['a', testKey],
            ['.', 'b', 0],
          ],
        ],
        { a: { [testKey]: 1 } },
      ),
    ).toEqual({ a: { b: [1] } });

    expect(pickRename([[[testKey, 0], '.b']], { [testKey]: [123] })).toEqual({ [testKey]: { b: 123 } });
    expect(
      pickRename(
        [
          [
            [testKey, 0],
            ['.', 1, 'b'],
          ],
        ],
        { [testKey]: [123] },
      ),
    ).toEqual({ [testKey]: [undefined, { b: 123 }] });
    expect(
      pickRename(
        [
          [
            [testKey, 0],
            ['.', 1, 'b'],
          ],
        ],
        { [testKey]: [123] },
        { mode: 'merge' },
      ),
    ).toEqual({ [testKey]: [123, { b: 123 }] });
  });

  test('边界情况', () => {
    expect(() => pickRename([':test'], {})).toThrowError();
    expect(() => pickRename(['.:test'], {})).toThrowError();
    expect(() => pickRename(['test:'], {})).toThrowError();
    expect(pickRename(['a.b.c:test'], {})).toEqual({ test: undefined });
    expect(() => pickRename(['test:a.b'], { a: 1 }, { mode: 'merge' })).toThrowError();
    expect(() => pickRename([':', {}], { a: 1 })).toThrowError();
    expect(() => pickRename(['', {}], { a: 1 })).toThrowError();
    expect(() => pickRename([{}], { a: 1 })).toThrowError();
    expect(() => pickRename({ '': {} }, { a: 1 })).toThrowError();
    expect(() => pickRename({ '123': {} }, { a: 1 })).toThrowError();
    expect(() => pickRename({ [Symbol('123')]: {} }, { a: 1 })).toThrowError();
    // @ts-expect-error test
    expect(pickRename(null, { a: 1 })).toEqual({});
  });
});
