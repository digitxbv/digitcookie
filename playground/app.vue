<template>
  <div>
    <h1>DigitCookie playground</h1>
    <p>consent: <strong>{{ consent ?? 'not asked' }}</strong> · banner visible: {{ visible }}</p>
    <p>
      <button @click="accept">accept()</button>
      <button @click="reject">reject()</button>
      <button @click="withdraw">withdraw()</button>
    </p>
    <p>
      locale (fake $i18n):
      <button @click="locale = 'en'">en</button>
      <button @click="locale = 'nl'">nl</button>
      <strong>{{ locale }}</strong>
    </p>
    <p>onAccept log:</p>
    <ClientOnly>
      <ul>
        <li v-for="line in log" :key="line">{{ line }}</li>
        <li v-if="!log.length"><em>not fired</em></li>
      </ul>
    </ClientOnly>
    <details>
      <summary>runtime config</summary>
      <pre>{{ config }}</pre>
    </details>
    <footer>
      <CookieSettings />
    </footer>
  </div>
</template>

<script setup lang="ts">
import type { Ref } from 'vue'
const { consent, visible, accept, reject, withdraw, onAccept } = useCookieConsent()
const config = useRuntimeConfig().public.digitcookie
// Stand-in for @nuxtjs/i18n: the module reads `$i18n.locale` when present.
const { $i18n } = useNuxtApp() as unknown as { $i18n: { locale: Ref<string> } }
const locale = $i18n.locale

// Stand-in for a bundled SDK (PostHog etc.): fires on click, or on load for a returning accepted visitor.
const log = ref<string[]>([])
// Client-only: onAccept also fires during SSR for an accepted visitor, and a timestamp would mismatch on hydration.
if (import.meta.client) {
  onAccept(() => {
    const line = `onAccept fired at ${new Date().toISOString()}`
    log.value.push(line)
    console.log('[digitcookie] ' + line)
  })
}
</script>
