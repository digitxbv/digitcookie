import { addImports, createResolver, defineNuxtModule } from '@nuxt/kit'

export type Locale = 'en' | 'nl'

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
  purpose: Partial<Record<Locale, string>>
  expiry: string
}

export interface ModuleOptions {
  /** `false` installs the module dark: no banner, no gating, nothing rendered. */
  enabled: boolean
  cookie: {
    name: string
    /** e.g. `.floynk.com` to share the consent cookie between www and app. */
    domain?: string
    maxAgeDays: number
  }
  /** Script tags injected into `<head>` only after Accept. Order preserved. */
  scripts: GatedScript[]
  /** Sugar: emit the GTM loader plus dataLayer/gtag consent push on Accept. */
  gtm?: { id: string }
  /** The Declaration shown by "Show cookies". */
  cookies: DeclaredCookie[]
  /** Force a locale; otherwise @nuxtjs/i18n → `<html lang>` → `en`. */
  locale?: Locale
  /** Deep-merged over the packaged texts. */
  texts: Partial<Record<Locale, Record<string, string>>>
}

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

    nuxt.options.runtimeConfig.public.digitcookie = options

    addImports({ name: 'useCookieConsent', from: resolve('./runtime/composables/useCookieConsent') })

    if (!options.enabled) {
      return
    }
  },
})

declare module '@nuxt/schema' {
  interface PublicRuntimeConfig {
    digitcookie: ModuleOptions
  }
}
