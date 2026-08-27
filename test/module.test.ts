import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { setup, $fetch } from '@nuxt/test-utils/e2e'

describe('module', async () => {
  await setup({
    rootDir: fileURLToPath(new URL('./fixtures/basic', import.meta.url)),
  })

  it('loads and exposes defaulted options on runtimeConfig.public.digitcookie', async () => {
    const config = await $fetch<Record<string, unknown>>('/api/config')
    expect(config).toEqual({
      enabled: true,
      cookie: { name: 'digitcookie', maxAgeDays: 365 },
      scripts: [],
      cookies: [],
      texts: {},
    })
  })
})
