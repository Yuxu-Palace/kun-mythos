import { describe, expect, test } from 'vitest';
import { checkPrivateType, getPrivateMeta, setPrivateMeta } from '@/atomic-functions/private/private-info-ctrl';
import { MFT } from '~/tests/utils';

MFT((module, { format }) => {
  test(`${format} 导出检查`, () => {
    // @ts-expect-error 禁止导出
    expect(module.checkPrivateType).toBeUndefined();
    // @ts-expect-error 禁止导出
    expect(module.getPrivateMeta).toBeUndefined();
    // @ts-expect-error 禁止导出
    expect(module.setPrivateMeta).toBeUndefined();
  });
});

describe('private-info-ctrl', () => {
  test('基本使用', () => {
    const obj = { a: 1 };
    expect(getPrivateMeta(obj, 'test')).toBeUndefined();
    const metadata = {};
    setPrivateMeta(obj, 'test', metadata);
    setPrivateMeta(obj, 'test', { b: 2 });
    expect(getPrivateMeta(obj, 'test')).toBe(metadata);
    // @ts-expect-error test
    expect(metadata.b).toBe(2);
    expect(obj).toEqual({ a: 1 });

    expect(checkPrivateType(obj, 'test')).toBe(true);
    expect(checkPrivateType(obj, 'test1')).toBe(false);
  });

  test('边缘情况', () => {
    expect(() => getPrivateMeta(null, 'test')).toThrowError(TypeError);
    expect(() => getPrivateMeta(undefined, 'test')).toThrowError(TypeError);
    expect(() => checkPrivateType(null, 'test')).toThrowError(TypeError);
  });
});
