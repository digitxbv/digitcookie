export default defineNuxtConfig({
  modules: ['../src/module'],
  devtools: { enabled: false },
  compatibilityDate: '2025-07-15',
  digitcookie: {
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
