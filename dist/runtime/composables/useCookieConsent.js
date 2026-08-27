import { useCookie, useNuxtApp, useRequestURL, useState } from "#imports";
import { parseConsent } from "../cookie.js";
import { createConsent } from "../consent.js";
import { useDigitCookieOptions } from "../options.js";
const KEY = "$digitcookie";
export function useCookieConsent() {
  const nuxtApp = useNuxtApp();
  if (nuxtApp[KEY]) return nuxtApp[KEY];
  const { cookie, scripts, gtm } = useDigitCookieOptions();
  const raw = useCookie(cookie.name, { readonly: true });
  const consent = useState("digitcookie:consent", () => parseConsent(raw.value)?.state ?? null);
  const visible = useState("digitcookie:visible", () => consent.value === null);
  nuxtApp[KEY] = createConsent({
    consent,
    visible,
    options: cookie,
    scripts,
    gtm: gtm || void 0,
    document: import.meta.client ? document : null,
    secure: useRequestURL().protocol === "https:",
    reload: () => location.reload()
  });
  return nuxtApp[KEY];
}
