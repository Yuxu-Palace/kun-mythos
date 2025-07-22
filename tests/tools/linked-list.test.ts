import { describe, expect, test } from 'vitest';
import { MFT } from '../utils';

MFT(({ LinkedList }) => {
  test('导出检查', () => {
    expect(typeof LinkedList).toBe('function');
    expect(typeof LinkedList.from).toBe('function');
    expect(typeof LinkedList.fromEntries).toBe('function');
    const list = new LinkedList<string, number>();
    expect(typeof list.pop).toBe('function');
    expect(typeof list.push).toBe('function');
    expect(typeof list.toArray).toBe('function');
    expect(typeof list.toEntries).toBe('function');
    expect(typeof list.toValues).toBe('function');
    expect(typeof list.shift).toBe('function');
    expect(typeof list.unshift).toBe('function');
    expect(typeof list[Symbol.iterator]).toBe('function');
  });

  describe('基本使用', () => {
    test('from', () => {
      expect(LinkedList.from()).toBeInstanceOf(LinkedList);
      expect(LinkedList.from([1, 2, 3])).toBeInstanceOf(LinkedList);
    });

    test('fromEntries', () => {
      expect(LinkedList.fromEntries()).toBeInstanceOf(LinkedList);
      expect(
        LinkedList.fromEntries([
          [1, { label: 'test1' }],
          [2, { label: 'test2' }],
          [3, { label: 'test3' }],
        ]),
      ).toBeInstanceOf(LinkedList);
    });

    test('toEntries', () => {
      const list = new LinkedList<string, number>();
      list.push('1', 1);
      list.push('2', 2);
      expect([...list.toEntries()]).toEqual([
        ['1', 1],
        ['2', 2],
      ]);
    });

    test('toValues', () => {
      const list = new LinkedList<string, number>();
      list.push('1', 1);
      list.push('2', 2);
      expect([...list.toValues()]).toEqual(['1', '2']);
      expect([...list.toValues(true)]).toEqual([
        { data: '1', metadata: 1 },
        { data: '2', metadata: 2 },
      ]);
    });

    test('toArray', () => {
      const list = new LinkedList<string, number>();
      list.push('1', 1);
      list.push('2', 2);
      expect(list.toArray()).toEqual(['1', '2']);
      expect(list.toArray(true)).toEqual([
        { data: '1', metadata: 1 },
        { data: '2', metadata: 2 },
      ]);
    });

    test('push', () => {
      const list = new LinkedList<string, number>();
      list.push('1', 1);
      list.push('2');
      expect(list.toArray(true)).toEqual([
        { data: '1', metadata: 1 },
        { data: '2', metadata: undefined },
      ]);
    });

    test('push', () => {
      const list = new LinkedList<string, number>();
      list.push('1', 1);
      list.push('2');
      expect(list.pop()).toEqual('2');
      expect(list.pop(true)).toEqual({ data: '1', metadata: 1 });
      expect(list.pop()).toBeUndefined();
    });

    test('unshift', () => {
      const list = new LinkedList<string, number>();
      list.unshift('1', 1);
      list.unshift('2');
      expect(list.toArray(true)).toEqual([
        { data: '2', metadata: undefined },
        { data: '1', metadata: 1 },
      ]);
    });

    test('shift', () => {
      const list = new LinkedList<string, number>();
      list.unshift('1', 1);
      list.unshift('2');
      expect(list.shift()).toEqual('2');
      expect(list.shift(true)).toEqual({ data: '1', metadata: 1 });
      expect(list.shift()).toBeUndefined();
    });

    test('迭代器', () => {
      const list = new LinkedList<string, number>();
      list.unshift('1', 1);
      list.unshift('2');
      expect([...list]).toEqual(['2', '1']);
      expect(Array.from(list)).toEqual(['2', '1']);
    });
  });
});
