import viteTsConfigPaths from 'vite-tsconfig-paths';
import {
  // defaultInclude,
  defineConfig,
} from 'vitest/config';

export default defineConfig({
  plugins: [viteTsConfigPaths()],
  // Configure Vitest (https://vitest.dev/config/)
  test: {
    coverage: {
      include: ['src/**'],
      provider: 'v8',
      cleanOnRerun: false,
      reporter: ['json', 'html'],
      reportOnFailure: true,
      thresholds: {
        lines: 90,
        functions: 90,
        branches: 90,
        statements: 90,
      },
    },
    clearMocks: true,
    // typecheck: {
    //   include: [...defaultInclude],
    //   checker: 'tsc',
    // },
  },
});
