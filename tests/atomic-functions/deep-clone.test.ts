import { expect, test } from 'vitest';
import { MFT } from '../utils';

MFT(({ deepClone }) => {
  test('导出检查', () => {
    expect(typeof deepClone).toBe('function');
  });

  test('基本使用', () => {
    const testObj: any = {
      array: [1, 2, 3],
      obj: { a: 1, b: 2 },
      voKey: 0,
      date: new Date(),
      null: null,
    };
    testObj.array.push(testObj);
    testObj.array.push(testObj.obj);
    testObj.obj.testObj = testObj;
    testObj.obj.array = testObj.array;

    const result = deepClone(testObj);
    expect(result).toEqual(testObj);
    expect(result.array).not.toBe(testObj.array);
    expect(result.obj).not.toBe(testObj.obj);
    expect(result.voKey).toBe(testObj.voKey);
    expect(result.date).not.toBe(testObj.date);
    expect(result.date.getTime()).toBe(testObj.date.getTime());
    expect(result.null).toBeNull();
    expect(result.obj.testObj).not.toBe(testObj);
    expect(result.obj.testObj).toBe(result);
    expect(result.obj.array).not.toBe(testObj.obj.array);
    expect(result.obj.array).toBe(result.array);
  });
});
