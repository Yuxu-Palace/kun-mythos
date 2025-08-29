import { expect, test } from 'vitest';
import { MFT } from '../utils';

MFT(({ sleep, sleepSync, getNow }) => {
  test('导出检查', () => {
    expect(typeof sleep).toBe('function');
  });

  test('基本使用', async () => {
    let start1 = getNow();
    const cancel1 = await sleep(10);
    expect(getNow() - start1).toBeGreaterThan(10);
    expect(cancel1).toBe(false);

    const cancel2 = await new Promise((res, rej) => {
      start1 = getNow();
      const sleepController = sleep(100)
        .then(res)
        .catch(rej)
        .finally(() => {
          expect(getNow() - start1).toBeLessThan(100);
        });
      sleepController.abort();
    });
    expect(cancel2).toBe(true);

    const cancel3 = await new Promise((res, rej) => {
      start1 = getNow();
      const sleepController = sleep(100)
        .then(res)
        .catch(rej)
        .finally(() => {
          expect(getNow() - start1).toBeLessThan(100);
        });
      sleepController.resolve(false);
    });
    expect(cancel3).toBe(false);

    const startSync = getNow();
    sleepSync(10);
    expect(getNow() - startSync).toBeGreaterThan(10);
  });
});
