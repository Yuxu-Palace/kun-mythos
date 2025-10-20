import codspeedPlugin from '@codspeed/vitest-plugin';
import viteTsConfigPaths from 'vite-tsconfig-paths';
import { defaultInclude, defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [viteTsConfigPaths(), codspeedPlugin()],
  // Configure Vitest (https://vitest.dev/config/)
  test: {
    coverage: {
      include: ['src/**'],
      provider: 'v8',
      cleanOnRerun: false,
      reporter: ['json', 'html'],
      reportOnFailure: true,
      thresholds: {
        autoUpdate: true,
        lines: 100,
        functions: 100,
        branches: 100,
        statements: 100,
      },
    },
    clearMocks: true,
    // typecheck: {
    //   include: [...defaultInclude],
    //   checker: 'tsc',
    // },
    benchmark: {
      include: [...defaultInclude],
    },
  },
});
