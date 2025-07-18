import { version } from '../package.json';
import { MFT } from './utils';

MFT(({ VERSION }, { test }) => {
  test('version check', ({ expect }) => {
    expect(VERSION).toBe(version);
  });
});
