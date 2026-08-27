import { computed, unref, type ComputedRef, type Ref } from 'vue'
import { useNuxtApp } from '#imports'
import { mergeTexts, packaged, pickLocale, type Locale, type Texts } from '../i18n'
import { useDigitCookieOptions } from '../options'

/** Shape of `@nuxtjs/i18n`'s `$i18n` we rely on; read dynamically so the module stays optional. */
interface I18nLike { locale: Ref<string> | string }

export function useTexts(): { locale: ComputedRef<Locale>, t: ComputedRef<Texts> } {
  const options = useDigitCookieOptions()
  const i18n = (useNuxtApp() as { $i18n?: I18nLike }).$i18n

  const locale = computed(() => pickLocale({
    forced: options.locale,
    i18nLocale: i18n ? unref(i18n.locale) : null,
    htmlLang: options.htmlLang,
  }))
  const t = computed(() => mergeTexts(packaged[locale.value], options.texts?.[locale.value]))
  return { locale, t }
}
