import { expect, test } from 'vitest';
import { MFT } from '../utils';

MFT(({ iife }) => {
  test('导出检查', () => {
    expect(typeof iife).toBe('function');
  });

  test('基本使用', async () => {
    expect(iife(() => 1)).toBe(1);
    expect(await iife(async () => 1)).toBe(1);
    expect(() =>
      iife(() => {
        throw new Error('error');
      }),
    ).toThrowError(Error);
  });

  test('边缘情况', () => {
    // @ts-expect-error test
    expect(() => iife(undefined)).toThrowError(TypeError);
  });
});
