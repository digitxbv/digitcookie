import { describe, expect, it } from 'vitest'
import { localize, mergeTexts, packaged, pickLocale } from '../src/runtime/i18n'

describe('pickLocale', () => {
  it('forced wins over everything', () => {
    expect(pickLocale({ forced: 'nl', i18nLocale: 'en', htmlLang: 'en' })).toBe('nl')
  })
  it('then @nuxtjs/i18n', () => {
    expect(pickLocale({ i18nLocale: 'nl', htmlLang: 'en' })).toBe('nl')
    expect(pickLocale({ i18nLocale: 'nl-BE', htmlLang: 'en' })).toBe('nl')
  })
  it('then <html lang>, prefix only', () => {
    expect(pickLocale({ htmlLang: 'nl-NL' })).toBe('nl')
    expect(pickLocale({ htmlLang: 'en-GB' })).toBe('en')
  })
  it('unknown or missing falls back to en', () => {
    expect(pickLocale({ i18nLocale: 'de', htmlLang: 'fr' })).toBe('en')
    expect(pickLocale({})).toBe('en')
    expect(pickLocale({ forced: null, i18nLocale: null, htmlLang: '' })).toBe('en')
    expect(pickLocale({ forced: '', i18nLocale: 'nl' })).toBe('nl') // runtimeConfig turns undefined into ''
  })
})

describe('mergeTexts', () => {
  it('overrides a single key and leaves the rest packaged', () => {
    const t = mergeTexts(packaged.nl, { accept: 'Alles toestaan', table: { name: 'Cookie' } })
    expect(t.accept).toBe('Alles toestaan')
    expect(t.reject).toBe('Weigeren')
    expect(t.table).toEqual({ name: 'Cookie', provider: 'Aanbieder', purpose: 'Doel', expiry: 'Bewaartermijn' })
    expect(packaged.nl.accept).toBe('Accepteren') // untouched
  })
  it('rejects unknown keys at the type level', () => {
    // @ts-expect-error unknown key
    mergeTexts(packaged.en, { acept: 'x' })
    // @ts-expect-error unknown nested key
    mergeTexts(packaged.en, { table: { naam: 'x' } })
  })
  it('both packaged locales have the same keys', () => {
    expect(Object.keys(packaged.nl).sort()).toEqual(Object.keys(packaged.en).sort())
  })
})

describe('localize', () => {
  it('passes strings through and picks the locale, falling back to en', () => {
    expect(localize('Remembers', 'nl')).toBe('Remembers')
    expect(localize({ en: 'Remembers', nl: 'Onthoudt' }, 'nl')).toBe('Onthoudt')
    expect(localize({ en: 'Remembers' }, 'nl')).toBe('Remembers')
    expect(localize({ nl: 'Onthoudt' }, 'en')).toBe('Onthoudt')
  })
})
