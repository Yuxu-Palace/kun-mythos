import { expect, test } from 'vitest';
import { MFT } from '../utils';

MFT(({ autoBindFnThis }) => {
  test('导出检查', () => {
    expect(typeof autoBindFnThis).toBe('function');
  });

  test('基本使用', async () => {
    const obj: Record<PropertyKey, any> = {
      a: 1,
      b: 2,
      c: 3,
      add(a: number, b: number) {
        return a + b + this.c;
      },
    };
    obj.funcs = obj;
    obj.funcs.sub = function (a: number) {
      return a - this.c;
    };

    const boundObj = autoBindFnThis(obj);
    const boundAdd = boundObj.add;
    expect(boundAdd(1, 2)).toBe(6);
    expect(boundObj.a).toBe(1);
    expect(boundObj.funcs).toBe(obj);

    const boundObj2 = autoBindFnThis(obj, true);
    const boundSub = boundObj2.funcs.sub;
    expect(boundSub(1)).toBe(-2);
    expect(boundObj2.a).toBe(1);
    expect(boundObj2.funcs).not.toBe(obj);
  });
});
