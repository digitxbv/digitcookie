<template>
  <div>
    <h1>DigitCookie playground</h1>
    <p>consent: <strong>{{ consent ?? 'not asked' }}</strong></p>
    <p>
      <button @click="accept">Accept</button>
      <button @click="reject">Reject</button>
      <button @click="withdraw">Withdraw</button>
      <button @click="open">Open banner</button>
    </p>
    <p>banner visible: {{ visible }}</p>
    <pre>{{ config }}</pre>
  </div>
</template>

<script setup lang="ts">
const { consent, visible, accept, reject, withdraw, open } = useCookieConsent()
const config = useRuntimeConfig().public.digitcookie
</script>
