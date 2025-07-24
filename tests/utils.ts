import { bench as benchmark, describe, expect, test } from 'vitest';

type Module = typeof import('../src/index');

const IS_CI = Boolean(process.env.CI);
const IS_BENCH = Boolean(process.env.BENCH);

const MODE = {
  SOURCE: 'src',
  CJS: 'cjs',
  ESM: 'esm',
  UMD: 'umd',
} as const;

type Mode = (typeof MODE)[keyof typeof MODE];

interface Context {
  format: Mode;
  IS_CI: boolean;
  IS_BENCH: boolean;

  describe: typeof describe;
  test: typeof test;
  expect: typeof expect;
}

function getBaseCtx<T extends Partial<Context> & Pick<Context, 'format'>>(extendsCtx: T) {
  return {
    IS_CI,
    IS_BENCH,

    describe,
    test,
    expect,
    ...extendsCtx,
  };
}

function getExt(format: Mode = 'src') {
  switch (format) {
    case MODE.SOURCE:
      return 'ts';
    case MODE.CJS:
      return 'cjs';
    case MODE.ESM:
      return 'mjs';
    case MODE.UMD:
      return 'js';
    default:
      format satisfies never;
  }
}

export async function loadModule(format: Mode = 'src'): Promise<Module> {
  if (format === MODE.SOURCE) return import('../src/index');
  return import(`../dist/${format}/index.${getExt(format)}`);
}

const benchApply: ProxyHandler<typeof benchmark>['apply'] = (target, thisArg, argArray) => {
  if (!IS_BENCH) return;

  const [, , option = {}] = argArray;

  // 默认清空热身
  option.warmupTime ||= 0;
  option.warmupIterations ||= 0;
  // 默认 500ms
  option.time ||= 500;
  // 最少 5K 次迭代
  option.iterations ||= 5_000;

  argArray[2] = option;

  return Reflect.apply(target, thisArg, argArray);
};

export const bench: typeof benchmark = new Proxy(benchmark, {
  get(target, prop, receiver) {
    return new Proxy(Reflect.get(target, prop, receiver), { apply: benchApply });
  },
  apply: benchApply,
});

/**
 * 本地模式下测试源码
 *
 * CI 模式下测试打包产物
 *
 * @param testFunc 测试函数
 */
export function MFT(testFunc: (module: Module, ctx: Context) => any) {
  describe.concurrent.each(Object.values(MODE))('mutiple format test', async (format) => {
    // 本地只测试源码
    const sourceOnly = !IS_CI && format === MODE.SOURCE;

    describe.runIf(sourceOnly || IS_CI)(`${format} test`, async () => {
      const module = await loadModule(format);

      await testFunc(module, getBaseCtx({ format }));
    });
  });
}
