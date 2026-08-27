import { type Texts } from './texts/en.js';
export type Locale = 'en' | 'nl';
export type { Texts };
/** Deep-partial of the packaged texts; unknown keys are a type error. */
export type TextOverrides = {
    [K in keyof Texts]?: Texts[K] extends string ? string : Partial<Texts[K]>;
};
export declare const packaged: Record<Locale, Texts>;
export interface LocaleSources {
    /** `digitcookie.locale`; Nuxt serialises an unset value as `""`. */
    forced?: string | null;
    /** `@nuxtjs/i18n` current locale, when that module is installed. */
    i18nLocale?: string | null;
    /** `<html lang>`, e.g. `nl-NL`. */
    htmlLang?: string | null;
}
export declare function pickLocale({ forced, i18nLocale, htmlLang }: LocaleSources): Locale;
export declare function mergeTexts(base: Texts, overrides?: TextOverrides): Texts;
/** `cookies[].purpose` is a plain string or per-locale; fall back to English, then any value. */
export declare function localize(value: string | Partial<Record<Locale, string>>, locale: Locale): string;
