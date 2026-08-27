import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { setup, $fetch } from '@nuxt/test-utils/e2e'

await setup({
  rootDir: fileURLToPath(new URL('./fixtures/basic', import.meta.url)),
})

const returning = { headers: { cookie: 'digitcookie=accepted:2026-08-27T10:00:00.000Z' } }

describe('SSR reads the consent cookie', () => {
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

describe('SSR banner at app root', () => {
  it('renders the banner for a new visitor without the host placing it', async () => {
    const html = await $fetch<string>('/')
    expect(html).toContain('role="dialog"')
    expect(html).toContain('data-digitcookie="accept"')
  })

  it('renders no banner markup for a returning visitor', async () => {
    const html = await $fetch<string>('/', returning)
    expect(html).not.toContain('role="dialog"')
  })
})
