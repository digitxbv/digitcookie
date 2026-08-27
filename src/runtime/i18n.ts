import { en, type Texts } from './texts/en'
import { nl } from './texts/nl'

export type Locale = 'en' | 'nl'
export type { Texts }

/** Deep-partial of the packaged texts; unknown keys are a type error. */
export type TextOverrides = { [K in keyof Texts]?: Texts[K] extends string ? string : Partial<Texts[K]> }

export const packaged: Record<Locale, Texts> = { en, nl }

export interface LocaleSources {
  /** `digitcookie.locale`; Nuxt serialises an unset value as `""`. */
  forced?: string | null
  /** `@nuxtjs/i18n` current locale, when that module is installed. */
  i18nLocale?: string | null
  /** `<html lang>`, e.g. `nl-NL`. */
  htmlLang?: string | null
}

function known(value: string | null | undefined): Locale | undefined {
  const prefix = value?.trim().toLowerCase().split(/[-_]/)[0]
  return prefix === 'en' || prefix === 'nl' ? prefix : undefined
}

export function pickLocale({ forced, i18nLocale, htmlLang }: LocaleSources): Locale {
  return known(forced) ?? known(i18nLocale) ?? known(htmlLang) ?? 'en'
}

export function mergeTexts(base: Texts, overrides?: TextOverrides): Texts {
  if (!overrides) return base
  return { ...base, ...overrides, table: { ...base.table, ...overrides.table } }
}

/** `cookies[].purpose` is a plain string or per-locale; fall back to English, then any value. */
export function localize(value: string | Partial<Record<Locale, string>>, locale: Locale): string {
  if (typeof value === 'string') return value
  return value[locale] ?? value.en ?? Object.values(value)[0] ?? ''
}
