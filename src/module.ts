import { addComponent, addImports, addTemplate, createResolver, defineNuxtModule } from '@nuxt/kit'
import type { Locale, TextOverrides } from './runtime/i18n'

export type { Locale, TextOverrides }

export interface ExternalScript {
  src: string
  async?: boolean
  defer?: boolean
  attrs?: Record<string, string>
}

export interface InlineScript {
  inline: string
}

export type GatedScript = ExternalScript | InlineScript

export interface DeclaredCookie {
  name: string
  provider: string
  /** Plain string, or per-locale. */
  purpose: string | Partial<Record<Locale, string>>
  expiry: string
}

export interface CookieOptions {
  name: string
  /** e.g. `.floynk.com` to share the consent cookie between www and app. */
  domain?: string
  maxAgeDays: number
}

export interface ModuleOptions {
  /** `false` installs the module dark: no banner, no gating, nothing rendered. */
  enabled: boolean
  /** Merged over the defaults (`digitcookie`, 365 days), so `{ domain: '.example.com' }` is enough. */
  cookie: Partial<CookieOptions>
  /** Script tags injected into `<head>` only after Accept. Order preserved. */
  scripts: GatedScript[]
  /** Sugar: emit the GTM loader plus dataLayer/gtag consent push on Accept. */
  gtm?: { id: string }
  /** The Declaration shown by "Show cookies". */
  cookies: DeclaredCookie[]
  /** Force a locale; otherwise @nuxtjs/i18n → `<html lang>` → `en`. */
  locale?: Locale
  /** Deep-merged over the packaged texts. */
  texts: Partial<Record<Locale, TextOverrides>>
}

/** What the runtime reads back; `htmlLang` is captured from `app.head.htmlAttrs.lang` at build time. */
export type ResolvedOptions = Omit<ModuleOptions, 'cookie'> & { cookie: CookieOptions, htmlLang?: string }

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: '@digitxbv/digitcookie',
    configKey: 'digitcookie',
    compatibility: { nuxt: '>=4.0.0' },
  },
  defaults: {
    enabled: true,
    cookie: {
      name: 'digitcookie',
      maxAgeDays: 365,
    },
    scripts: [],
    cookies: [],
    texts: {},
  },
  setup(options, nuxt) {
    const { resolve } = createResolver(import.meta.url)
    nuxt.options.build.transpile.push(resolve('./runtime'))

    // Nuxt regenerates PublicRuntimeConfig from the host's config, which drops the optional
    // markers; read it back through useDigitCookieOptions() for the real shape.
    const htmlLang = nuxt.options.app.head?.htmlAttrs?.lang
    const base = options as ResolvedOptions // defaults are deep-merged, so cookie.name/maxAgeDays exist
    const resolved: ResolvedOptions = htmlLang ? { ...base, htmlLang } : base
    nuxt.options.runtimeConfig.public.digitcookie = resolved as typeof nuxt.options.runtimeConfig.public.digitcookie

    addImports({ name: 'useCookieConsent', from: resolve('./runtime/composables/useCookieConsent') })

    addComponent({ name: 'CookieSettings', filePath: resolve('./runtime/components/CookieSettings.vue') })
    addComponent({ name: 'CookieBanner', filePath: resolve('./runtime/components/CookieBanner.vue') })

    if (!options.enabled) {
      return
    }

    // Mount <CookieBanner /> at the app root by wrapping the host's main component.
    nuxt.hook('app:resolve', (app) => {
      const hostApp = app.mainComponent!
      const banner = resolve('./runtime/components/CookieBanner.vue')
      const wrapper = addTemplate({
        filename: 'digitcookie-app.vue',
        write: true,
        getContents: () => [
          '<template>',
          '  <HostApp />',
          '  <CookieBanner />',
          '</template>',
          '',
          '<script setup lang="ts">',
          `import HostApp from ${JSON.stringify(hostApp)}`,
          `import CookieBanner from ${JSON.stringify(banner)}`,
          '</script>',
          '',
        ].join('\n'),
      })
      app.mainComponent = wrapper.dst
    })
  },
})

declare module '@nuxt/schema' {
  interface PublicRuntimeConfig {
    digitcookie: ResolvedOptions
  }
}
