<template>
  <div>
    <h1>DigitCookie playground</h1>
    <p>consent: <strong>{{ consent ?? 'not asked' }}</strong> · banner visible: {{ visible }}</p>
    <p>
      <button @click="accept">accept()</button>
      <button @click="reject">reject()</button>
      <button @click="withdraw">withdraw()</button>
    </p>
    <pre>{{ config }}</pre>
    <footer>
      <CookieSettings />
    </footer>
  </div>
</template>

<script setup lang="ts">
const { consent, visible, accept, reject, withdraw } = useCookieConsent()
const config = useRuntimeConfig().public.digitcookie
</script>
