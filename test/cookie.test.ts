import { describe, expect, it } from 'vitest'
import { parseConsent, readCookie, serializeConsent, consentCookieString } from '../src/runtime/cookie'

const at = new Date('2026-08-27T10:00:00.000Z')

describe('consent cookie codec', () => {
  it('round-trips accepted with its timestamp', () => {
    expect(serializeConsent('accepted', at)).toBe('accepted:2026-08-27T10:00:00.000Z')
    expect(parseConsent('accepted:2026-08-27T10:00:00.000Z')).toEqual({ state: 'accepted', at })
  })

  it('round-trips rejected with its timestamp', () => {
    expect(parseConsent(serializeConsent('rejected', at))).toEqual({ state: 'rejected', at })
  })

  it.each([undefined, null, '', 'garbage', 'accepted', 'accepted:not-a-date', 'maybe:2026-08-27T10:00:00.000Z'])(
    'treats %s as not asked',
    (value) => {
      expect(parseConsent(value)).toBeNull()
    },
  )
})

describe('consentCookieString', () => {
  it('sets path, SameSite=Lax, max-age in seconds and the configured domain', () => {
    expect(consentCookieString('digitcookie', 'accepted:x', { maxAgeDays: 365, domain: '.floynk.com', secure: false }))
      .toBe('digitcookie=accepted:x; Path=/; SameSite=Lax; Max-Age=31536000; Domain=.floynk.com')
  })

  it('adds Secure on https and omits Domain when unset', () => {
    expect(consentCookieString('digitcookie', 'rejected:x', { maxAgeDays: 1, secure: true }))
      .toBe('digitcookie=rejected:x; Path=/; SameSite=Lax; Max-Age=86400; Secure')
  })

  it('clears with Max-Age=0 when value is null', () => {
    expect(consentCookieString('digitcookie', null, { maxAgeDays: 365, domain: '.floynk.com', secure: true }))
      .toBe('digitcookie=; Path=/; SameSite=Lax; Max-Age=0; Domain=.floynk.com; Secure')
  })
})

describe('readCookie', () => {
  it('finds the named cookie among others', () => {
    expect(readCookie('a=1; digitcookie=accepted:2026-08-27T10:00:00.000Z; b=2', 'digitcookie'))
      .toBe('accepted:2026-08-27T10:00:00.000Z')
    expect(readCookie('a=1', 'digitcookie')).toBeNull()
    expect(readCookie('', 'digitcookie')).toBeNull()
  })
})
