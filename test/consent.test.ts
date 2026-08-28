import { describe, expect, it, vi } from 'vitest'
import { ref } from 'vue'
import { createConsent } from '../src/runtime/consent'
import type { ConsentState } from '../src/runtime/cookie'

function harness(initial: ConsentState | null = null, options = {}) {
  const writes: string[] = []
  const doc = { set cookie(v: string) { writes.push(v) } }
  const reload = vi.fn()
  const api = createConsent({
    consent: ref<ConsentState | null>(initial),
    visible: ref(false),
    options: { name: 'digitcookie', maxAgeDays: 365, ...options },
    document: doc as unknown as Document,
    secure: true,
    reload,
    now: () => new Date('2026-08-27T10:00:00.000Z'),
  })
  return { api, writes, reload }
}

describe('useCookieConsent behaviour', () => {
  it('starts not asked, then accept() records accepted', () => {
    const { api, writes } = harness()
    expect(api.consent.value).toBeNull()
    expect(api.accepted.value).toBe(false)
    api.accept()
    expect(api.consent.value).toBe('accepted')
    expect(api.accepted.value).toBe(true)
    expect(writes).toEqual([
      'digitcookie=accepted:2026-08-27T10:00:00.000Z; Path=/; SameSite=Lax; Max-Age=31536000; Secure',
    ])
  })

  it('writes the configured domain and max-age', () => {
    const { api, writes } = harness(null, { domain: '.floynk.com', maxAgeDays: 30 })
    api.reject()
    expect(writes).toEqual([
      'digitcookie=rejected:2026-08-27T10:00:00.000Z; Path=/; SameSite=Lax; Max-Age=2592000; Domain=.floynk.com; Secure',
    ])
  })

  it('onAccept fires synchronously for a returning accepted visitor', () => {
    const { api } = harness('accepted')
    const cb = vi.fn()
    api.onAccept(cb)
    expect(cb).toHaveBeenCalledTimes(1)
  })

  it('onAccept fires once on a later accept() and never on reject()', () => {
    const { api } = harness()
    const cb = vi.fn()
    api.onAccept(cb)
    expect(cb).not.toHaveBeenCalled()
    api.reject()
    expect(cb).not.toHaveBeenCalled()
    api.accept()
    api.accept()
    expect(cb).toHaveBeenCalledTimes(1)
  })

  it('reject() from a fresh visitor does not reload', () => {
    const { api, reload } = harness()
    api.reject()
    expect(api.consent.value).toBe('rejected')
    expect(reload).not.toHaveBeenCalled()
  })

  it('withdraw: accepted → reject() clears the cookie, writes rejected, reloads', () => {
    const { api, writes, reload } = harness('accepted', { domain: '.floynk.com' })
    api.withdraw()
    expect(api.consent.value).toBe('rejected')
    expect(writes).toEqual([
      'digitcookie=; Path=/; SameSite=Lax; Max-Age=0; Domain=.floynk.com; Secure',
      'digitcookie=rejected:2026-08-27T10:00:00.000Z; Path=/; SameSite=Lax; Max-Age=31536000; Domain=.floynk.com; Secure',
    ])
    expect(reload).toHaveBeenCalledTimes(1)
  })

  it('open() shows the banner; accept()/reject() hide it', () => {
    const { api } = harness('accepted')
    expect(api.visible.value).toBe(false)
    api.open()
    expect(api.visible.value).toBe(true)
    api.accept()
    expect(api.visible.value).toBe(false)
  })

  it('sync(): prerendered "not asked" state is replaced by the cookie after hydration', () => {
    const { api } = harness(null)
    api.visible.value = true
    const cb = vi.fn()
    api.onAccept(cb)
    api.sync('rejected')
    expect(api.visible.value).toBe(false)
    expect(cb).not.toHaveBeenCalled()
    api.sync('accepted')
    expect(api.accepted.value).toBe(true)
    expect(cb).toHaveBeenCalledTimes(1)
    api.sync('accepted')
    expect(cb).toHaveBeenCalledTimes(1)
  })
})
