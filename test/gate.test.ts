// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from 'vitest'
import { injectScripts } from '../src/runtime/gate'

declare global {
  interface Window { dataLayer?: unknown[]; __digitcookieRan?: number }
}

// Inline scripts run in jsdom's own window, which vitest exposes as `jsdom.window`.
const inner = (globalThis as unknown as { jsdom: { window: Window } }).jsdom.window

function injected() {
  return [...document.head.querySelectorAll('script[data-digitcookie]')] as HTMLScriptElement[]
}

beforeEach(() => {
  document.head.innerHTML = ''
  delete window.dataLayer
  delete inner.__digitcookieRan
})

describe('injectScripts', () => {
  it('appends entries to <head> in order with their attributes', () => {
    injectScripts([
      { src: 'https://a.example/a.js', async: true, attrs: { 'data-x': '1' } },
      { inline: 'window.__digitcookieRan = 1' },
      { src: 'https://b.example/b.js', defer: true },
    ], document)
    const tags = injected()
    expect(tags.map(t => t.src || t.textContent)).toEqual([
      'https://a.example/a.js',
      'window.__digitcookieRan = 1',
      'https://b.example/b.js',
    ])
    expect(tags[0]!.async).toBe(true)
    expect(tags[0]!.getAttribute('data-x')).toBe('1')
    expect(tags[2]!.defer).toBe(true)
  })

  it('is idempotent', () => {
    const entries = [{ src: 'https://a.example/a.js' }]
    injectScripts(entries, document)
    injectScripts(entries, document)
    expect(injected()).toHaveLength(1)
  })

  it('executes inline entries', () => {
    injectScripts([{ inline: 'window.__digitcookieRan = (window.__digitcookieRan || 0) + 1' }], document)
    expect(inner.__digitcookieRan).toBe(1)
  })

  it('injects the GTM loader and pushes consent to dataLayer in order', () => {
    injectScripts([], document, { id: 'GTM-TEST' })
    const loader = injected()[0]!
    expect(loader.src).toBe('https://www.googletagmanager.com/gtm.js?id=GTM-TEST')
    expect(loader.async).toBe(true)

    const dl = window.dataLayer!
    expect(dl).toHaveLength(3)
    expect(dl[0]).toMatchObject({ event: 'gtm.js' })
    expect((dl[0] as Record<string, unknown>)['gtm.start']).toEqual(expect.any(Number))
    expect(dl[1]).toEqual({ event: 'consent_updated' })
    expect([...(dl[2] as IArguments)]).toEqual(['consent', 'update', {
      ad_storage: 'granted',
      ad_user_data: 'granted',
      ad_personalization: 'granted',
      analytics_storage: 'granted',
    }])
  })

  it('does nothing when there is nothing to inject', () => {
    injectScripts([], document)
    expect(injected()).toHaveLength(0)
    expect(window.dataLayer).toBeUndefined()
  })
})
