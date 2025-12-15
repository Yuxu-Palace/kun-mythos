import { expect, test } from 'vitest';
import { MFT } from '../utils';

MFT(({ skipFirstCall, isSkipFirstCall }) => {
  test('导出测试', () => {
    expect(skipFirstCall).toBeTypeOf('function');
  });

  test('功能测试', () => {
    let called = false;
    const fn = () => {
      called = true;
    };
    const cf = skipFirstCall(fn);
    expect(cf).not.toBe(fn);
    expect(cf).toBeTypeOf('function');
    cf();
    expect(called).toBe(false);
    cf();
    expect(called).toBe(true);
    expect(isSkipFirstCall(cf)).toBe(true);
    expect(isSkipFirstCall(fn)).toBe(false);

    let flag = 0;
    const fn2 = () => {
      flag = 2;
    };
    const cf2 = skipFirstCall(fn2, () => {
      flag = 1;
    });
    expect(cf2).not.toBe(fn2);
    expect(cf2).toBeTypeOf('function');
    cf2();
    expect(flag).toBe(1);
    cf2();
    expect(flag).toBe(2);
  });

  test('边缘测试', () => {
    // @ts-expect-error
    expect(() => skipFirstCall(null)).toThrowError(TypeError);

    let flag = 0;
    const fn2 = () => {
      flag = 2;
    };
    // @ts-expect-error
    const cf2 = skipFirstCall(fn2, null);
    expect(cf2).not.toBe(fn2);
    expect(cf2).toBeTypeOf('function');
    cf2();
    expect(flag).toBe(0);
    cf2();
    expect(flag).toBe(2);
  });
});
