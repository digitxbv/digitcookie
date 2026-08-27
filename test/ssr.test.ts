import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { setup, $fetch } from '@nuxt/test-utils/e2e'

describe('SSR reads the consent cookie', async () => {
  await setup({
    rootDir: fileURLToPath(new URL('./fixtures/basic', import.meta.url)),
  })

  it('renders null when the visitor has no cookie', async () => {
    const html = await $fetch<string>('/')
    expect(html).toContain('<span id="consent">null</span>')
  })

  it('renders the recorded answer from the request cookie', async () => {
    const html = await $fetch<string>('/', {
      headers: { cookie: 'digitcookie=rejected:2026-08-27T10:00:00.000Z' },
    })
    expect(html).toContain('<span id="consent">rejected</span>')
  })

  it('ignores a garbage cookie value', async () => {
    const html = await $fetch<string>('/', { headers: { cookie: 'digitcookie=yes' } })
    expect(html).toContain('<span id="consent">null</span>')
  })
})
