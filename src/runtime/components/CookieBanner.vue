<template>
  <div
    v-if="visible"
    ref="dialog"
    class="digitcookie"
    role="dialog"
    aria-modal="false"
    aria-labelledby="digitcookie-title"
    aria-describedby="digitcookie-body"
    tabindex="-1"
  >
    <h2 id="digitcookie-title" class="digitcookie__title">{{ t.title }}</h2>
    <p id="digitcookie-body" class="digitcookie__body">{{ t.body }}</p>

    <button
      v-if="cookies.length"
      type="button"
      class="digitcookie__toggle"
      data-digitcookie="toggle"
      :aria-expanded="showCookies"
      :aria-controls="showCookies ? 'digitcookie-declaration' : undefined"
      @click="showCookies = !showCookies"
    >
      {{ showCookies ? t.hideCookies : t.showCookies }}
    </button>

    <table v-if="showCookies" id="digitcookie-declaration" class="digitcookie__table">
      <thead>
        <tr>
          <th scope="col">{{ t.table.name }}</th>
          <th scope="col">{{ t.table.provider }}</th>
          <th scope="col">{{ t.table.purpose }}</th>
          <th scope="col">{{ t.table.expiry }}</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="c in cookies" :key="c.name">
          <td>{{ c.name }}</td>
          <td>{{ c.provider }}</td>
          <td>{{ c.purpose.en }}</td>
          <td>{{ c.expiry }}</td>
        </tr>
      </tbody>
    </table>

    <div class="digitcookie__actions">
      <button type="button" class="digitcookie__btn" data-digitcookie="accept" @click="accept">{{ t.accept }}</button>
      <button type="button" class="digitcookie__btn" data-digitcookie="reject" @click="reject">{{ t.reject }}</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { nextTick, onMounted, ref, watch } from 'vue'
import { useCookieConsent } from '../composables/useCookieConsent'
import { useDigitCookieOptions } from '../options'
import { en as t } from '../texts/en'

const { cookies } = useDigitCookieOptions()
const { visible, accept, reject } = useCookieConsent()

const showCookies = ref(false)
const dialog = ref<HTMLElement | null>(null)
let previousFocus: Element | null = null

function focusDialog() {
  previousFocus = document.activeElement
  dialog.value?.focus()
}

onMounted(() => {
  if (visible.value) focusDialog()
})

watch(visible, async (shown) => {
  if (shown) {
    await nextTick()
    focusDialog()
  }
  else {
    showCookies.value = false
    if (previousFocus instanceof HTMLElement) previousFocus.focus()
    previousFocus = null
  }
})
</script>

<style scoped>
.digitcookie {
  --_bg: var(--digitcookie-background, #fff);
  --_text: var(--digitcookie-text, #1a1a1a);
  --_btn-bg: var(--digitcookie-button-background, #1a1a1a);
  --_btn-text: var(--digitcookie-button-text, #fff);
  --_radius: var(--digitcookie-radius, 8px);
  --_font: var(--digitcookie-font, system-ui, sans-serif);

  position: fixed;
  left: 50%;
  bottom: 1rem;
  transform: translateX(-50%);
  z-index: 2147483000;
  box-sizing: border-box;
  width: min(36rem, calc(100vw - 2rem));
  max-height: calc(100vh - 2rem);
  overflow: auto;
  padding: 1.25rem;
  background: var(--_bg);
  color: var(--_text);
  border-radius: var(--_radius);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  font: 15px/1.5 var(--_font);
}
.digitcookie:focus { outline: none; }
.digitcookie__title { margin: 0 0 0.5rem; font-size: 1.1em; font-weight: 600; }
.digitcookie__body { margin: 0 0 0.75rem; }
.digitcookie__toggle {
  margin: 0 0 0.75rem;
  padding: 0;
  border: 0;
  background: none;
  color: inherit;
  font: inherit;
  text-decoration: underline;
  cursor: pointer;
}
.digitcookie__table { width: 100%; margin: 0 0 1rem; border-collapse: collapse; font-size: 0.9em; }
.digitcookie__table th,
.digitcookie__table td { padding: 0.25rem 0.5rem 0.25rem 0; text-align: left; vertical-align: top; border-bottom: 1px solid rgba(128, 128, 128, 0.3); }
.digitcookie__actions { display: flex; gap: 0.5rem; }
.digitcookie__btn {
  flex: 1 1 0;
  padding: 0.6rem 1rem;
  border: 0;
  border-radius: var(--_radius);
  background: var(--_btn-bg);
  color: var(--_btn-text);
  font: inherit;
  font-weight: 600;
  cursor: pointer;
}
.digitcookie__btn:focus-visible,
.digitcookie__toggle:focus-visible { outline: 2px solid currentColor; outline-offset: 2px; }
</style>
