import { useCookie, useNuxtApp, useRequestURL, useState } from '#imports'
import { parseConsent, readCookie, type ConsentState } from '../cookie'
import { createConsent, type CookieConsent } from '../consent'
import { useDigitCookieOptions } from '../options'

const KEY = '$digitcookie'

export function useCookieConsent(): CookieConsent {
  const nuxtApp = useNuxtApp() as ReturnType<typeof useNuxtApp> & { [KEY]?: CookieConsent }
  if (nuxtApp[KEY]) return nuxtApp[KEY]

  const { cookie, scripts, gtm } = useDigitCookieOptions()
  // Read once (SSR + hydration); writes go straight to document.cookie in createConsent.
  const raw = useCookie<string | null>(cookie.name, { readonly: true })
  const consent = useState<ConsentState | null>('digitcookie:consent', () => parseConsent(raw.value)?.state ?? null)
  const visible = useState<boolean>('digitcookie:visible', () => consent.value === null)

  const api = createConsent({
    consent,
    visible,
    options: cookie,
    scripts,
    gtm: gtm || undefined,
    document: import.meta.client ? document : null,
    secure: useRequestURL().protocol === 'https:',
    reload: () => location.reload(),
  })
  nuxtApp[KEY] = api

  // Prerendered/cached pages ship the build-time state in the payload; trust the cookie instead.
  if (import.meta.client) {
    const fromCookie = () => api.sync(parseConsent(readCookie(document.cookie, cookie.name))?.state ?? null)
    if (nuxtApp.isHydrating) nuxtApp.hook('app:mounted', fromCookie)
    else fromCookie()
  }
  return api
}
