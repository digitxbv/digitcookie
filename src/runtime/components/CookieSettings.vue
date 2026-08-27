<template>
  <button type="button" class="digitcookie-settings" @click="open">{{ t.settingsLink }}</button>
</template>

<script setup lang="ts">
import { useCookieConsent } from '../composables/useCookieConsent'
import { useTexts } from '../composables/useTexts'

const { open } = useCookieConsent()
const { t } = useTexts()
</script>

<style scoped>
.digitcookie-settings {
  padding: 0;
  border: 0;
  background: none;
  color: inherit;
  font: inherit;
  text-decoration: underline;
  cursor: pointer;
}
</style>
