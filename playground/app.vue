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
    <pre>{{ config }}</pre>
    <footer>
      <CookieSettings />
    </footer>
  </div>
</template>

<script setup lang="ts">
import type { Ref } from 'vue'
const { consent, visible, accept, reject, withdraw } = useCookieConsent()
const config = useRuntimeConfig().public.digitcookie
// Stand-in for @nuxtjs/i18n: the module reads `$i18n.locale` when present.
const { $i18n } = useNuxtApp() as unknown as { $i18n: { locale: Ref<string> } }
const locale = $i18n.locale
</script>
