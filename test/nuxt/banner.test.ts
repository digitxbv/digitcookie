import { beforeEach, describe, expect, it } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { useNuxtApp, useRuntimeConfig, useState } from '#imports'
import { ref } from 'vue'
import { axe } from 'vitest-axe'
import * as axeMatchers from 'vitest-axe/matchers'
import CookieBanner from '../../src/runtime/components/CookieBanner.vue'
import CookieSettings from '../../src/runtime/components/CookieSettings.vue'
import { useCookieConsent } from '../../src/runtime/composables/useCookieConsent'

expect.extend(axeMatchers)

const cookies = [
  { name: 'digitcookie', provider: 'this site', purpose: { en: 'Remembers your choice.' }, expiry: '1 year' },
  { name: '_ga', provider: 'Google', purpose: { en: 'Analytics.', nl: 'Statistieken.' }, expiry: '2 years' },
]

const nuxtApp = useNuxtApp() as { $i18n?: { locale: unknown } }

beforeEach(() => {
  document.cookie = 'digitcookie=; Max-Age=0; Path=/'
  // Fresh visitor by default: the shared state the composable is built on.
  useState('digitcookie:consent').value = null
  useState('digitcookie:visible').value = true
  delete nuxtApp.$i18n
  Object.assign(useRuntimeConfig().public.digitcookie, { locale: '', texts: {}, htmlLang: '' })
})

async function mountBanner(overrides: Record<string, unknown> = {}) {
  const config = useRuntimeConfig().public.digitcookie
  Object.assign(config, { cookies, ...overrides })
  return mountSuspended(CookieBanner, { attachTo: document.body })
}

describe('<CookieBanner />', () => {
  it('renders no banner for a returning visitor (cookie wins over hydrated state)', async () => {
    document.cookie = 'digitcookie=accepted:2026-08-27T10:00:00.000Z; Path=/'
    const w = await mountBanner()
    expect(w.find('[role="dialog"]').exists()).toBe(false)
  })

  it('Accept records accepted and hides the banner', async () => {
    const w = await mountBanner()
    expect(w.find('[role="dialog"]').exists()).toBe(true)
    await w.get('[data-digitcookie="accept"]').trigger('click')
    expect(useCookieConsent().consent.value).toBe('accepted')
    expect(document.cookie).toContain('digitcookie=accepted:')
    expect(w.find('[role="dialog"]').exists()).toBe(false)
  })

  it('Reject records rejected and hides the banner', async () => {
    const w = await mountBanner()
    await w.get('[data-digitcookie="reject"]').trigger('click')
    expect(useCookieConsent().consent.value).toBe('rejected')
    expect(document.cookie).toContain('digitcookie=rejected:')
    expect(w.find('[role="dialog"]').exists()).toBe(false)
  })

  it('Accept and Reject share the same class set', async () => {
    const w = await mountBanner()
    expect(w.get('[data-digitcookie="accept"]').classes()).toEqual(w.get('[data-digitcookie="reject"]').classes())
  })

  it('Show cookies toggles the Declaration table with one row per configured cookie', async () => {
    const w = await mountBanner()
    expect(w.find('table').exists()).toBe(false)
    await w.get('[data-digitcookie="toggle"]').trigger('click')
    const rows = w.findAll('tbody tr')
    expect(rows).toHaveLength(2)
    expect(rows[1]!.text()).toContain('_ga')
    expect(rows[1]!.text()).toContain('Google')
    expect(rows[1]!.text()).toContain('Analytics.')
    expect(rows[1]!.text()).toContain('2 years')
    await w.get('[data-digitcookie="toggle"]').trigger('click')
    expect(w.find('table').exists()).toBe(false)
  })

  it('hides the Show cookies toggle when no cookies are configured', async () => {
    const w = await mountBanner({ cookies: [] })
    expect(w.find('[data-digitcookie="toggle"]').exists()).toBe(false)
  })

  it('has no axe violations when open', async () => {
    const w = await mountBanner()
    await w.get('[data-digitcookie="toggle"]').trigger('click')
    expect(await axe(w.element as HTMLElement)).toHaveNoViolations()
  })

  it('moves focus into the dialog on show', async () => {
    const w = await mountBanner()
    await w.vm.$nextTick()
    expect(w.get('[role="dialog"]').element.contains(document.activeElement)).toBe(true)
  })
})

describe('<CookieSettings />', () => {
  it('reopens the banner while keeping the stored answer', async () => {
    useState('digitcookie:consent').value = 'rejected'
    useState('digitcookie:visible').value = false
    const banner = await mountBanner()
    const link = await mountSuspended(CookieSettings, { attachTo: document.body })
    expect(banner.find('[role="dialog"]').exists()).toBe(false)
    await link.get('button').trigger('click')
    await banner.vm.$nextTick()
    expect(banner.find('[role="dialog"]').exists()).toBe(true)
    expect(useCookieConsent().consent.value).toBe('rejected')
  })

  describe('locale', () => {
    it('renders Dutch strings and the per-locale purpose when $i18n says nl', async () => {
      nuxtApp.$i18n = { locale: ref('nl') }
      const w = await mountBanner()
      expect(w.find('#digitcookie-title').text()).toBe('Deze website maakt gebruik van cookies')
      expect(w.find('[data-digitcookie="accept"]').text()).toBe('Accepteren')
      await w.find('[data-digitcookie="toggle"]').trigger('click')
      expect(w.text()).toContain('Statistieken.')
      expect(w.text()).toContain('Remembers your choice.') // no nl purpose → falls back to en
    })

    it('switches live when the i18n locale changes', async () => {
      const locale = ref('en')
      nuxtApp.$i18n = { locale }
      const w = await mountBanner()
      expect(w.find('[data-digitcookie="accept"]').text()).toBe('Accept')
      locale.value = 'nl'
      await w.vm.$nextTick()
      expect(w.find('[data-digitcookie="accept"]').text()).toBe('Accepteren')
    })

    it('forced locale beats i18n; texts overrides merge in', async () => {
      nuxtApp.$i18n = { locale: ref('en') }
      const w = await mountBanner({ locale: 'nl', texts: { nl: { accept: 'Alles toestaan' } } })
      expect(w.find('[data-digitcookie="accept"]').text()).toBe('Alles toestaan')
      expect(w.find('[data-digitcookie="reject"]').text()).toBe('Weigeren')
    })

    it('falls back to <html lang> then en', async () => {
      const w = await mountBanner({ htmlLang: 'nl-NL' })
      expect(w.find('[data-digitcookie="accept"]').text()).toBe('Accepteren')
      const s = await mountSuspended(CookieSettings)
      expect(s.text()).toBe('Cookie-instellingen')
    })
  })
})
