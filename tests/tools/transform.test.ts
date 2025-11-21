import { expect, test } from 'vitest';
import { MFT } from '../utils';

MFT(({ applyTransform, applyTransforms, fallback, deepClone, isArray, isPlainObject, isNumber }) => {
  test('导出测试', () => {
    expect(typeof applyTransform).toBe('function');
    expect(typeof applyTransforms).toBe('function');
  });

  const testObj = {
    needArray: 123,
    needObj: 123,
    array: [],
    obj: { needArray: 123, array: [1, 'needNumber', 3] },
  };

  const transformArray = fallback(isArray, () => []);
  const transformObject = fallback(isPlainObject, () => {
    return {};
  });

  const transformNumber = (defaultValue: number) => fallback(isNumber, () => defaultValue);

  test('基本使用', () => {
    expect(applyTransform('needArray', transformArray, deepClone(testObj))).toEqual({
      needArray: [],
      needObj: 123,
      array: [],
      obj: { needArray: 123, array: [1, 'needNumber', 3] },
    });

    expect(applyTransform('obj.needArray', transformArray, deepClone(testObj))).toEqual({
      needArray: 123,
      needObj: 123,
      array: [],
      obj: { needArray: [], array: [1, 'needNumber', 3] },
    });

    expect(applyTransform('obj.array.1', transformNumber(0), deepClone(testObj))).toEqual({
      needArray: 123,
      needObj: 123,
      array: [],
      obj: { needArray: 123, array: [1, 0, 3] },
    });

    expect(applyTransform('needArray', (_, source) => source.obj, deepClone(testObj))).toEqual({
      needArray: testObj.obj,
      needObj: 123,
      array: [],
      obj: { needArray: 123, array: [1, 'needNumber', 3] },
    });

    expect(applyTransforms([], deepClone(testObj))).toEqual({
      needArray: 123,
      needObj: 123,
      array: [],
      obj: { needArray: 123, array: [1, 'needNumber', 3] },
    });

    expect(
      applyTransforms(
        [
          ['needArray', transformArray],
          ['obj.needArray', transformArray],
          ['array', transformArray],
          ['obj.array.1', transformNumber(2)],
          ['needObj', transformObject],
        ],
        deepClone(testObj),
      ),
    ).toEqual({
      needArray: [],
      needObj: {},
      array: [],
      obj: { needArray: [], array: [1, 2, 3] },
    });

    expect(
      applyTransforms(
        [
          ['needArray', transformArray],
          ['obj.needArray', transformArray],
          ['array', transformArray],
          ['obj.array.1', transformNumber(2)],
          ['needObj', transformObject],
          ['obj.array.3', (_, __, origin) => origin.needArray],
        ],
        deepClone(testObj),
      ),
    ).toEqual({
      needArray: [],
      needObj: {},
      array: [],
      obj: { needArray: [], array: [1, 2, 3, []] },
    });

    expect(
      applyTransforms(
        [
          ['obj.array.3', (_, __, origin) => origin.needArray],
          ['needArray', transformArray],
          ['obj.needArray', transformArray],
          ['array', transformArray],
          ['obj.array.1', transformNumber(2)],
          ['needObj', transformObject],
        ],
        deepClone(testObj),
      ),
    ).toEqual({
      needArray: [],
      needObj: {},
      array: [],
      obj: { needArray: [], array: [1, 2, 3, 123] },
    });
  });

  test('数组 keyPath 使用', () => {
    expect(applyTransform(['needArray'], transformArray, deepClone(testObj))).toEqual({
      needArray: [],
      needObj: 123,
      array: [],
      obj: { needArray: 123, array: [1, 'needNumber', 3] },
    });

    expect(
      applyTransforms(
        [
          ['obj.array.3'.split('.'), (_, __, origin) => origin.needArray],
          ['needArray', transformArray],
          ['obj.needArray'.split('.'), transformArray],
          ['array', transformArray],
          ['obj.array.1', transformNumber(2)],
          ['needObj', transformObject],
        ],
        deepClone(testObj),
      ),
    ).toEqual({
      needArray: [],
      needObj: {},
      array: [],
      obj: { needArray: [], array: [1, 2, 3, 123] },
    });

    const testKey = Symbol('testKey');
    expect(applyTransform([testKey, 'a', 1], transformNumber(2), deepClone(testObj))).toEqual({
      [testKey]: { a: [undefined, 2] },
      needArray: 123,
      needObj: 123,
      array: [],
      obj: { needArray: 123, array: [1, 'needNumber', 3] },
    });
    expect(applyTransform(['a', testKey, 4], transformNumber(2), { a: { [testKey]: [1, 2, 3] } })).toEqual({
      a: { [testKey]: [1, 2, 3, undefined, 2] },
    });
  });

  test('边缘情况', () => {
    expect(() => applyTransform('', transformArray, testObj)).toThrowError();
    expect(applyTransform('a.b', transformArray, {})).toEqual({ a: { b: [] } });
    expect(applyTransform('a', transformArray, {})).toEqual({ a: [] });
  });
});
