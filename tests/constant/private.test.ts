import { expect, test } from 'vitest';
import { MFT } from '../utils';

MFT((module, { format }) => {
  test(`${format} 导出检查`, () => {
    // @ts-expect-error 禁止导出
    expect(module.GLOBAL_PRIVATE_KEY).toBeUndefined();
    // @ts-expect-error 禁止导出
    expect(module.PRIVATE_KEY).toBeUndefined();
  });
});
