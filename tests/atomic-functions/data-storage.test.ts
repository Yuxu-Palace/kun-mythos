import { expect, test } from 'vitest';
import { MFT } from '../utils';

MFT(({ storage }) => {
  test('导出检查', () => {
    expect(typeof storage.set).toBe('function');
    expect(typeof storage.get).toBe('function');
  });

  test('基本使用', () => {
    const objKey = {};
    const getter = storage.set(objKey, 123);
    expect(typeof getter).toBe('function');
    expect(getter()).toBe(123);
    expect(storage.get(objKey)).toBe(123);
    expect(storage.set(Symbol('test'), 123)()).toBe(123);
  });

  test('私有数据', () => {
    const objKey = {};
    const privateKey = Symbol('privateKey');
    const getter = storage.set(objKey, 123, privateKey);
    const privateKey2 = Symbol('privateKey2');
    expect(typeof getter).toBe('function');
    expect(getter()).toBe(123);
    expect(storage.get(objKey, privateKey)).toBe(123);
    expect(storage.set(Symbol('test'), 123, privateKey)()).toBe(123);
    expect(storage.set(objKey, 321, privateKey2)()).toBe(321);
    expect(storage.get(objKey, privateKey)).toBe(123);
  });

  test('边界情况', () => {
    const objKey = {};
    const privateKey = 'privateKey';
    expect(storage.set(objKey, 123, privateKey)()).toBe(123);
    // 对象为 null
    // @ts-expect-error test
    expect(() => storage.set(null, 123)).toThrowError(TypeError);
    // 读取不存在的私有属性
    expect(storage.get(objKey, 'privateKey2')).toBe(undefined);
    // 读取不存在的对象存储的私有属性
    expect(storage.get({}, 'privateKey2')).toBe(undefined);
    // 读取不存在的对象存储
    expect(storage.get({})).toBe(undefined);
    // key 使用 Symbol.for
    expect(() => storage.set(Symbol.for('test'), 123)).toThrowError(TypeError);
  });
});
