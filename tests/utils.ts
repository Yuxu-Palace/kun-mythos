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

/**
 * Creates a test context object by merging Vitest testing functions with the provided context properties.
 *
 * @param extendsCtx - Partial context object that must include `format` and `IS_CI`
 * @returns A context object containing Vitest functions and the supplied context properties
 */
function getBaseCtx<T extends Partial<Context> & Pick<Context, 'format' | 'IS_CI'>>(extendsCtx: T) {
  return {
    describe,
    test,
    expect,
    ...extendsCtx,
  };
}

/**
 * Dynamically imports and returns the module corresponding to the specified build format.
 *
 * If the format is `'src'`, loads the source module from the `src` directory. For `'cjs'` or `'esm'`, loads the built module from the appropriate distribution folder.
 *
 * @param format - The module format to load (`'src'`, `'cjs'`, or `'esm'`). Defaults to `'src'`.
 * @returns A promise resolving to the imported module.
 */
export async function loadModule(format: Mode = 'src'): Promise<Module> {
  if (format === MODE.SOURCE) return import('../src/index');
  return import(`../dist/${format}/index.${format === 'cjs' ? 'c' : ''}js`);
}

/**
 * Runs a test function against the module in multiple build formats, adapting to local or CI environments.
 *
 * Locally, tests are run only against the source format. In CI, tests are run only against built formats (CommonJS and ES modules).
 *
 * @param testFunc - A function that receives the loaded module and a test context for each applicable format.
 */
export function MFT(testFunc: (module: Module, ctx: Context) => any) {
  describe.concurrent.each(Object.values(MODE))('mutiple format test', async (format) => {
    // 本地只测试源码
    const sourceOnly = !IS_CI && format === MODE.SOURCE;
    // ci 模式下测试打包产物
    const ciOnly = IS_CI && format !== MODE.SOURCE;

    describe.runIf(sourceOnly || ciOnly)(`${format} test`, async () => {
      const module = await loadModule(format);

      await testFunc(module, getBaseCtx({ format, IS_CI }));
    });
  });
}
