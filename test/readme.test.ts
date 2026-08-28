import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import type { ModuleOptions } from '../src/module'

// Exhaustive at compile time: adding a key to ModuleOptions without listing it here is a type error.
const optionKeys: Record<keyof ModuleOptions, true> = {
  enabled: true,
  cookie: true,
  scripts: true,
  gtm: true,
  cookies: true,
  locale: true,
  texts: true,
}

const readme = readFileSync(new URL('../README.md', import.meta.url), 'utf8')
const headings = readme
  .split('\n')
  .filter(line => line.startsWith('#'))
  .map(line => line.replace(/^#+\s*/, '').replace(/`/g, '').trim())

describe('README', () => {
  it.each(Object.keys(optionKeys))('has a heading for option `%s`', (key) => {
    expect(headings).toContain(key)
  })

  it('documents the public API', () => {
    expect(headings).toContain('useCookieConsent()')
    expect(headings).toContain('<CookieSettings />')
    expect(readme).toContain('github:digitxbv/digitcookie#v0.1.3')
  })
})
