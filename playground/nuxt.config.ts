export default defineNuxtConfig({
  modules: ['../src/module'],
  devtools: { enabled: false },
  compatibilityDate: '2025-07-15',
  digitcookie: {
    // Dummy gated entries: nothing should hit the network until Accept.
    scripts: [
      { src: 'https://example.com/gated.js', async: true, attrs: { 'data-gated': 'true' } },
      { inline: 'console.log("[digitcookie] gated inline script ran")' },
    ],
    gtm: { id: 'GTM-PLAYGROUND' },
    cookies: [
      {
        name: 'digitcookie',
        provider: 'this site',
        purpose: {
          en: 'Remembers your cookie choice.',
          nl: 'Onthoudt je cookiekeuze.',
        },
        expiry: '1 year',
      },
    ],
  },
})
