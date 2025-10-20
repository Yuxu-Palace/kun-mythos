import { describe, expect, test } from 'vitest';
import { bench, MFT } from './utils';

MFT(
  ({ VERSION }, { format, IS_BENCH }) => {
    test('导出检查', () => {
      expect(typeof VERSION).toBe('string');
    });

    describe.runIf(IS_BENCH)(`${format}性能测试`, () => {
      bench('读取版本号', () => {
        // biome-ignore lint/nursery/noUnusedExpressions: test
        VERSION;
      });
    });
  },
  // 这个 option 复制之后要删除
  { skip: true },
);
