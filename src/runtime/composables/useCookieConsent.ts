import { useCookie, useNuxtApp, useRequestURL, useRuntimeConfig, useState } from '#imports'
import { parseConsent, type ConsentState } from '../cookie'
import { createConsent, type CookieConsent } from '../consent'

const KEY = '$digitcookie'

export function useCookieConsent(): CookieConsent {
  const nuxtApp = useNuxtApp() as ReturnType<typeof useNuxtApp> & { [KEY]?: CookieConsent }
  if (nuxtApp[KEY]) return nuxtApp[KEY]

  const { cookie } = useRuntimeConfig().public.digitcookie
  // Read once (SSR + hydration); writes go straight to document.cookie in createConsent.
  const raw = useCookie<string | null>(cookie.name, { readonly: true })
  const consent = useState<ConsentState | null>('digitcookie:consent', () => parseConsent(raw.value)?.state ?? null)
  const visible = useState<boolean>('digitcookie:visible', () => false)

  nuxtApp[KEY] = createConsent({
    consent,
    visible,
    options: cookie,
    document: import.meta.client ? document : null,
    secure: useRequestURL().protocol === 'https:',
    reload: () => location.reload(),
  })
  return nuxtApp[KEY]
}
