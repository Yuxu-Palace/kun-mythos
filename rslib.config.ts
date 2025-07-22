import path from 'node:path';
import { fileURLToPath } from 'node:url';
// import { pluginModuleFederation } from '@module-federation/rsbuild-plugin';
import { defineConfig, type RslibConfig } from '@rslib/core';
import tsConfig from './tsconfig.json';

// import pkg from './package.json';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

type OutputOption = RslibConfig['lib'][number]['output'];

const baseOutputOption = {
  cleanDistPath: true,
  minify: true,
} satisfies OutputOption;

export default defineConfig({
  lib: [
    {
      format: 'esm',
      dts: true,
      output: {
        ...baseOutputOption,
        distPath: { root: path.resolve(__dirname, 'dist/esm') },
      },
    },
    {
      format: 'cjs',
      output: {
        ...baseOutputOption,
        distPath: { root: path.resolve(__dirname, 'dist/cjs') },
      },
    },
    // {
    //   dts: true,
    //   format: 'mf',
    //   output: {
    //     //! 生产环境地址前缀, 必填
    //     assetPrefix: '',
    //     cleanDistPath: true,
    //     distPath: { root: path.resolve(__dirname, 'dist/mf') },
    //   },
    //   dev: {
    //     // 开发环境地址前缀
    //     assetPrefix: '',
    //   },
    //   tools: {
    //     rspack(config) {
    //       config.experiments = { outputModule: true };
    //     },
    //   },
    //   plugins: [
    //     pluginModuleFederation(
    //       {
    //         manifest: true,
    //         name: pkg.name,
    //         library: { type: 'module' },
    //         filename: 'remoteEntry.js',
    //         exposes: { '.': path.resolve(__dirname, 'src/index.ts') },
    //       },
    //       {}
    //     ),
    //   ],
    // },
  ],
  resolve: {
    alias: tsConfig.compilerOptions.paths,
  },
});
