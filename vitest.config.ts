import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'
import { defineVitestProject } from '@nuxt/test-utils/config'

const fixture = fileURLToPath(new URL('./test/fixtures/basic', import.meta.url))

export default defineConfig({
  test: {
    testTimeout: 60_000,
    hookTimeout: 120_000,
    projects: [
      {
        // Pure units + @nuxt/test-utils e2e (builds the fixture in-process).
        test: { name: 'node', include: ['test/*.test.ts'] },
      },
      await defineVitestProject({
        // Component tests in the Nuxt environment.
        test: {
          name: 'nuxt',
          include: ['test/nuxt/**/*.test.ts'],
          environmentOptions: { nuxt: { rootDir: fixture, domEnvironment: 'jsdom' } },
        },
      }),
    ],
  },
})
