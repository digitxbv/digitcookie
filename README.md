# @digitxbv/digitcookie

Self-hosted GDPR cookie-consent banner for DigitX sites. A Nuxt 4 module with zero runtime dependencies that replaces Cookiebot: one yes/no banner, a consent cookie, script gating, and a footer link to withdraw.

## Install

Pin a tag as a git dependency:

```json
"dependencies": {
  "@digitxbv/digitcookie": "github:digitxbv/digitcookie#v0.1.3"
}
```

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ['@digitxbv/digitcookie'],
  digitcookie: {
    gtm: { id: 'GTM-XXXX' },
    scripts: [
      { inline: '!function(f,b,e,v,n,t,s){/* Meta Pixel */}(window,document,"script","https://connect.facebook.net/en_US/fbevents.js");' },
    ],
    cookies: [
      { name: 'digitcookie', provider: 'this site', purpose: { en: 'Remembers your cookie choice.', nl: 'Onthoudt je cookiekeuze.' }, expiry: '1 year' },
      { name: '_ga', provider: 'Google', purpose: { en: 'Distinguishes visitors.', nl: 'Onderscheidt bezoekers.' }, expiry: '2 years' },
    ],
  },
})
```

Then drop `<CookieSettings />` in the footer. The banner mounts itself at the app root; nothing else to add.

## Options

All keys under `digitcookie` in `nuxt.config.ts`. Everything is optional; the defaults below are what you get with `digitcookie: {}`.

```ts
digitcookie: {
  enabled: true,
  cookie: { name: 'digitcookie', domain: undefined, maxAgeDays: 365 },
  scripts: [],
  gtm: undefined,
  cookies: [],
  locale: undefined,
  texts: {},
}
```

### `enabled`

`false` installs the module dark: no banner, no gating, nothing rendered. `useCookieConsent()` and `<CookieSettings />` still resolve so the host compiles.

### `cookie`

- `name` — consent cookie name. Default `digitcookie`.
- `domain` — set to e.g. `.floynk.com` to share one consent between `www` and `app`. Default: host only.
- `maxAgeDays` — cookie lifetime. Default `365`, which is convention, not a legal requirement.

The cookie holds `accepted:<ISO timestamp>` or `rejected:<ISO timestamp>`; absent means not yet asked.

### `scripts`

Script tags injected into `<head>`, in order, once, after the visitor accepts. Never on reject. Returning accepted visitors get them on page load.

```ts
scripts: [
  { src: 'https://snap.licdn.com/li.lms-analytics/insight.min.js', async: true, attrs: { 'data-partner': 'li' } },
  { inline: 'window._linkedin_partner_id = "12345";' },
]
```

Entries are `{ src, async?, defer?, attrs? }` or `{ inline }`.

### `gtm`

`{ id: 'GTM-XXXX' }` is sugar for the standard Google Tag Manager setup on accept: initialise `window.dataLayer`, inject the GTM loader, push `{ event: 'consent_updated' }`, then `gtag('consent', 'update', { ad_storage, ad_user_data, ad_personalization, analytics_storage: 'granted' })` so Google Ads conversions fire. There is no Consent Mode default/denied call: declined visitors never get GTM at all. Leave it out and put the loader in `scripts` if you want to push to `dataLayer` yourself.

### `cookies`

The Declaration shown by "Show cookies". Maintain this list by hand; nothing scans the site.

```ts
cookies: [
  { name: '_ga', provider: 'Google', purpose: { en: 'Distinguishes visitors.', nl: 'Onderscheidt bezoekers.' }, expiry: '2 years' },
  { name: '_fbp', provider: 'Meta', purpose: 'Ad attribution.', expiry: '3 months' },
]
```

`purpose` is a plain string or per-locale (`{ en, nl }`).

### `locale`

Force `'en'` or `'nl'`. When unset the module uses, in order: `$i18n.locale` if `@nuxtjs/i18n` is installed (reacts to live switches), the `lang` from `app.head.htmlAttrs` in `nuxt.config.ts`, then `en`.

### `texts`

Per-locale overrides, merged over the packaged strings. Unknown keys are type errors.

```ts
texts: {
  nl: { accept: 'Alles toestaan', table: { expiry: 'Vervalt' } },
  en: { body: 'We use cookies for analytics and ads.' },
}
```

Keys: `title`, `body`, `accept`, `reject`, `showCookies`, `hideCookies`, `settingsLink`, `table.{name,provider,purpose,expiry}`. Only `en` and `nl` ship; another language is a full `texts` override plus `locale`.

## `useCookieConsent()`

Auto-imported. Returns one shared instance per app.

| Member | Type | |
| --- | --- | --- |
| `consent` | `Ref<'accepted' \| 'rejected' \| null>` | Current answer |
| `accepted` | `ComputedRef<boolean>` | `consent === 'accepted'` |
| `visible` | `Ref<boolean>` | Banner is open |
| `accept()` / `reject()` | | What the banner buttons call |
| `withdraw()` | | Clears the cookie, writes `rejected`, reloads |
| `open()` | | Reopen the banner (what `<CookieSettings />` calls) |
| `onAccept(cb)` | | Runs `cb` on accept; immediately if already accepted |

Gate a bundled SDK with `onAccept`. It fires once per page: on click for a first-time accept, on load for a returning accepted visitor. For an accepted visitor it also runs during SSR, so call it from a `.client.ts` plugin or behind `import.meta.client`.

```ts
// plugins/posthog.client.ts
import posthog from 'posthog-js'

export default defineNuxtPlugin(() => {
  const { onAccept } = useCookieConsent()
  onAccept(() => {
    posthog.init(useRuntimeConfig().public.posthogKey, { api_host: 'https://eu.i.posthog.com' })
  })
})
```

## `<CookieSettings />`

A plain underlined button with the localised "Cookie settings" label that reopens the banner. Put it in the footer so withdrawal is always one click away.

```vue
<footer>
  <NuxtLink to="/privacy">Privacy</NuxtLink>
  <CookieSettings />
</footer>
```

## Theming

The banner is a fixed bottom-centre card. Override these custom properties on `:root` (or any ancestor):

```css
:root {
  --digitcookie-background: #fff;
  --digitcookie-text: #1a1a1a;
  --digitcookie-button-background: #1a1a1a;
  --digitcookie-button-text: #fff;
  --digitcookie-radius: 8px;
  --digitcookie-font: system-ui, sans-serif;
}
```

## Caveats

- **Safari ITP** may cap client-set cookies at 7 days. The consent cookie is written client-side on click, so Safari visitors may be re-asked weekly. Documented, not worked around.
- **365 days** is convention, not law. Change `cookie.maxAgeDays` if a DPA says otherwise.
- **Withdraw = reload.** Rejecting after a previous accept clears the cookie and reloads the page; scripts already running in the current page are not unloaded before that. Same practical limit Cookiebot has.
- **Migrating from Cookiebot**: the cookie name differs (`digitcookie`, not `CookieConsent`), so returning visitors are asked once more.

## What this deliberately does not do

- No per-category toggles: one yes/no covers analytics and marketing.
- No Consent Mode v2 default/denied signalling, no IAB TCF, no geo detection.
- No auto-blocking, DOM scanning or classifier; host-authored `<script>` tags are never touched.
- No server-side consent log; the cookie is the only record. `accept()`/`reject()` are the hook if a log is ever needed.
- No admin UI, no consent-ID display, no cookie scanner: `cookies` is maintained by hand.

## Development

```sh
pnpm i
pnpm dev        # playground on :3000
pnpm test
pnpm lint
pnpm dist       # build dist/ (named `dist`, not `build`: npm would run a `build` script on git install)
```

`dist/` is committed because sites install straight from a git tag (no registry, no build on install). To release: `pnpm dist`, commit `dist/`, then `git tag v0.x.y && git push origin main v0.x.y`; sites pin the tag.
