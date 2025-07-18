import { describe, expect, test } from 'vitest';

type Module = typeof import('../src/index');

const IS_CI = Boolean(process.env.CI);

const MODE = {
  SOURCE: 'src',
  CJS: 'cjs',
  ESM: 'esm',
} as const;

type Mode = (typeof MODE)[keyof typeof MODE];

interface Context {
  format: Mode;
  IS_CI: boolean;

  describe: typeof describe;
  test: typeof test;
  expect: typeof expect;
}

function getBaseCtx<T extends Partial<Context> & Pick<Context, 'format' | 'IS_CI'>>(extendsCtx: T) {
  return {
    describe,
    test,
    expect,
    ...extendsCtx,
  };
}

/**
 * 本地模式下测试源码
 *
 * CI 模式下测试打包产物
 *
 * @param testFunc 测试函数
 */
// biome-ignore lint/suspicious/noExplicitAny: is test
export function MFT(testFunc: (module: Module, ctx: Context) => any) {
  describe.concurrent.each(Object.values(MODE))('mutiple format test', async (format) => {
    // 本地只测试源码
    const sourceOnly = !IS_CI && format === MODE.SOURCE;
    // ci 模式下测试打包产物
    const ciOnly = IS_CI && format !== MODE.SOURCE;

    describe.runIf(sourceOnly || ciOnly)(`${format} test`, async () => {
      const module = (await (async () => {
        if (format === MODE.SOURCE) return import('../src/index');
        return import(`../dist/${format}/index.${format === 'cjs' ? 'c' : ''}js`);
      })()) as Module;

      await testFunc(module, getBaseCtx({ format, IS_CI }));
    });
  });
}
