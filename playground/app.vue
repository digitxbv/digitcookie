<template>
  <div>
    <h1>DigitCookie playground</h1>
    <pre>{{ config }}</pre>
  </div>
</template>

<script setup lang="ts">
const config = useRuntimeConfig().public.digitcookie
</script>
