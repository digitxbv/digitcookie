<template>
  <button type="button" class="digitcookie-settings" @click="open">{{ t.settingsLink }}</button>
</template>

<script setup>
import { useCookieConsent } from "../composables/useCookieConsent";
import { useTexts } from "../composables/useTexts";
const { open } = useCookieConsent();
const { t } = useTexts();
</script>

<style scoped>
.digitcookie-settings{background:none;border:0;color:inherit;cursor:pointer;font:inherit;padding:0;text-decoration:underline}
</style>
