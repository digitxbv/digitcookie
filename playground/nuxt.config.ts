export default defineNuxtConfig({
  modules: ['../src/module'],
  devtools: { enabled: false },
  compatibilityDate: '2025-07-15',
  app: { head: { htmlAttrs: { lang: 'en' } } },
  digitcookie: {
    // Gated entries: nothing should hit the network until Accept.
    scripts: [
      { src: 'https://example.com/gated.js', async: true, attrs: { 'data-gated': 'true' } },
      { inline: 'console.log("[digitcookie] gated inline script ran")' },
    ],
    gtm: { id: 'GTM-PLAYGROUND' },
    cookies: [
      { name: 'digitcookie', provider: 'this site', purpose: { en: 'Remembers your cookie choice.', nl: 'Onthoudt je cookiekeuze.' }, expiry: '1 year' },
      { name: '_ga', provider: 'Google', purpose: { en: 'Distinguishes visitors for analytics.', nl: 'Onderscheidt bezoekers voor analytics.' }, expiry: '2 years' },
      { name: '_gid', provider: 'Google', purpose: { en: 'Distinguishes visitors for 24 hours.', nl: 'Onderscheidt bezoekers gedurende 24 uur.' }, expiry: '1 day' },
      { name: '_fbp', provider: 'Meta', purpose: { en: 'Ad attribution.', nl: 'Advertentie-attributie.' }, expiry: '3 months' },
      { name: 'ph_phc_*', provider: 'PostHog', purpose: { en: 'Product analytics session.', nl: 'Productanalyse-sessie.' }, expiry: '1 year' },
    ],
  },
})
