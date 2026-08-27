// Mimics @nuxtjs/i18n's `$i18n.locale` so the playground can switch the banner live.
export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.provide('i18n', { locale: ref('en') })
})
