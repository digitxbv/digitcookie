import { computed, unref } from "vue";
import { useNuxtApp } from "#imports";
import { mergeTexts, packaged, pickLocale } from "../i18n.js";
import { useDigitCookieOptions } from "../options.js";
export function useTexts() {
  const options = useDigitCookieOptions();
  const i18n = useNuxtApp().$i18n;
  const locale = computed(() => pickLocale({
    forced: options.locale,
    i18nLocale: i18n ? unref(i18n.locale) : null,
    htmlLang: options.htmlLang
  }));
  const t = computed(() => mergeTexts(packaged[locale.value], options.texts?.[locale.value]));
  return { locale, t };
}
