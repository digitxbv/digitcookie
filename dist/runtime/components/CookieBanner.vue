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
      :aria-controls="showCookies ? 'digitcookie-declaration' : void 0"
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
          <td>{{ localize(c.purpose, locale) }}</td>
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

<script setup>
import { nextTick, onMounted, ref, watch } from "vue";
import { useCookieConsent } from "../composables/useCookieConsent";
import { localize } from "../i18n";
import { useDigitCookieOptions } from "../options";
import { useTexts } from "../composables/useTexts";
const { cookies } = useDigitCookieOptions();
const { visible, accept, reject } = useCookieConsent();
const { t, locale } = useTexts();
const showCookies = ref(false);
const dialog = ref(null);
let previousFocus = null;
function focusDialog() {
  previousFocus = document.activeElement;
  dialog.value?.focus();
}
onMounted(() => {
  if (visible.value) focusDialog();
});
watch(visible, async (shown) => {
  if (shown) {
    await nextTick();
    focusDialog();
  } else {
    showCookies.value = false;
    if (previousFocus instanceof HTMLElement) previousFocus.focus();
    previousFocus = null;
  }
});
</script>

<style scoped>
.digitcookie{--_bg:var(--digitcookie-background,#fff);--_text:var(--digitcookie-text,#1a1a1a);--_btn-bg:var(--digitcookie-button-background,#1a1a1a);--_btn-text:var(--digitcookie-button-text,#fff);--_radius:var(--digitcookie-radius,8px);--_font:var(--digitcookie-font,system-ui,sans-serif);background:var(--_bg);border-radius:var(--_radius);bottom:1rem;box-shadow:0 8px 32px rgba(0,0,0,.2);box-sizing:border-box;color:var(--_text);font:15px/1.5 var(--_font);left:50%;max-height:calc(100vh - 2rem);overflow:auto;padding:1.25rem;position:fixed;transform:translateX(-50%);width:min(36rem,calc(100vw - 2rem));z-index:2147483000}.digitcookie:focus{outline:none}.digitcookie__title{font-size:1.1em;font-weight:600;margin:0 0 .5rem}.digitcookie__body{margin:0 0 .75rem}.digitcookie__toggle{background:none;border:0;color:inherit;cursor:pointer;font:inherit;margin:0 0 .75rem;padding:0;text-decoration:underline}.digitcookie__table{border-collapse:collapse;font-size:.9em;margin:0 0 1rem;width:100%}.digitcookie__table td,.digitcookie__table th{border-bottom:1px solid hsla(0,0%,50%,.3);padding:.25rem .5rem .25rem 0;text-align:left;vertical-align:top}.digitcookie__actions{display:flex;gap:.5rem}.digitcookie__btn{background:var(--_btn-bg);border:0;border-radius:var(--_radius);color:var(--_btn-text);cursor:pointer;flex:1 1 0;font:inherit;font-weight:600;padding:.6rem 1rem}.digitcookie__btn:focus-visible,.digitcookie__toggle:focus-visible{outline:2px solid currentColor;outline-offset:2px}
</style>
