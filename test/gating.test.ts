// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ref } from 'vue'
import { createConsent } from '../src/runtime/consent'
import type { ConsentState } from '../src/runtime/cookie'

declare global {
  interface Window { dataLayer?: unknown[] }
}

const scripts = [{ src: 'https://a.example/a.js' }]

function make(initial: ConsentState | null) {
  return createConsent({
    consent: ref<ConsentState | null>(initial),
    visible: ref(initial === null),
    options: { name: 'digitcookie', maxAgeDays: 365 },
    scripts,
    gtm: { id: 'GTM-TEST' },
    document,
    secure: false,
    reload: vi.fn(),
  })
}

const injected = () => document.head.querySelectorAll('script[data-digitcookie]').length

beforeEach(() => {
  document.head.innerHTML = ''
  document.cookie = 'digitcookie=; Max-Age=0; Path=/'
  delete window.dataLayer
})

describe('script gating', () => {
  it.each([null, 'rejected'] as const)('injects nothing while consent is %s', (state) => {
    const api = make(state)
    expect(injected()).toBe(0)
    expect(window.dataLayer).toBeUndefined()
    api.reject()
    expect(injected()).toBe(0)
    expect(window.dataLayer).toBeUndefined()
  })

  it('injects on accept, before host callbacks, once', () => {
    const api = make(null)
    const seen: number[] = []
    api.onAccept(() => seen.push(injected()))
    api.accept()
    api.accept()
    expect(injected()).toBe(2) // GTM loader + one script
    expect(seen).toEqual([2])
    expect(window.dataLayer).toHaveLength(3)
  })

  it('injects on load for a returning accepted visitor', () => {
    make('accepted')
    expect(injected()).toBe(2)
  })
})
