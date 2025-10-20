import { expect, test } from 'vitest';
import { MFT } from '../utils';

MFT(({ getNow, isFunction }) => {
  test('导出检查', () => {
    expect(typeof getNow).toBe('function');
  });

  test('基本使用', async () => {
    expect(typeof getNow()).toBe('number');

    const old = performance.now;
    if (isFunction(performance.now)) {
      // @ts-expect-error test
      performance.now = null;
    } else {
      performance.now = getNow;
    }

    getNow.clearCache();
    expect(typeof getNow()).toBe('number');

    performance.now = old;
  });
});
