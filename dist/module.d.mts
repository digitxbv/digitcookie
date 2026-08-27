import * as _nuxt_schema from '@nuxt/schema';
import { Locale, TextOverrides } from '../dist/runtime/i18n.js';
export { Locale, TextOverrides } from '../dist/runtime/i18n.js';

interface ExternalScript {
    src: string;
    async?: boolean;
    defer?: boolean;
    attrs?: Record<string, string>;
}
interface InlineScript {
    inline: string;
}
type GatedScript = ExternalScript | InlineScript;
interface DeclaredCookie {
    name: string;
    provider: string;
    /** Plain string, or per-locale. */
    purpose: string | Partial<Record<Locale, string>>;
    expiry: string;
}
interface ModuleOptions {
    /** `false` installs the module dark: no banner, no gating, nothing rendered. */
    enabled: boolean;
    cookie: {
        name: string;
        /** e.g. `.floynk.com` to share the consent cookie between www and app. */
        domain?: string;
        maxAgeDays: number;
    };
    /** Script tags injected into `<head>` only after Accept. Order preserved. */
    scripts: GatedScript[];
    /** Sugar: emit the GTM loader plus dataLayer/gtag consent push on Accept. */
    gtm?: {
        id: string;
    };
    /** The Declaration shown by "Show cookies". */
    cookies: DeclaredCookie[];
    /** Force a locale; otherwise @nuxtjs/i18n → `<html lang>` → `en`. */
    locale?: Locale;
    /** Deep-merged over the packaged texts. */
    texts: Partial<Record<Locale, TextOverrides>>;
}
/** What the runtime reads back; `htmlLang` is captured from `app.head.htmlAttrs.lang` at build time. */
type ResolvedOptions = ModuleOptions & {
    htmlLang?: string;
};
declare const _default: _nuxt_schema.NuxtModule<ModuleOptions, ModuleOptions, false>;

declare module '@nuxt/schema' {
    interface PublicRuntimeConfig {
        digitcookie: ResolvedOptions;
    }
}

export { _default as default };
export type { DeclaredCookie, ExternalScript, GatedScript, InlineScript, ModuleOptions, ResolvedOptions };
