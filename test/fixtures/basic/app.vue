<template>
  <div>
    consent=<span id="consent">{{ consent ?? 'null' }}</span>
  </div>
</template>

<script setup lang="ts">
const { consent } = useCookieConsent()
</script>
