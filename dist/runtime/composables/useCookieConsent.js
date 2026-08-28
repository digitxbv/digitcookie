import { useCookie, useNuxtApp, useRequestURL, useState } from "#imports";
import { parseConsent, readCookie } from "../cookie.js";
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
  const api = createConsent({
    consent,
    visible,
    options: cookie,
    scripts,
    gtm: gtm || void 0,
    document: import.meta.client ? document : null,
    secure: useRequestURL().protocol === "https:",
    reload: () => location.reload()
  });
  nuxtApp[KEY] = api;
  if (import.meta.client) {
    const fromCookie = () => api.sync(parseConsent(readCookie(document.cookie, cookie.name))?.state ?? null);
    if (nuxtApp.isHydrating) nuxtApp.hook("app:mounted", fromCookie);
    else fromCookie();
  }
  return api;
}
