import { en } from "./texts/en.js";
import { nl } from "./texts/nl.js";
export const packaged = { en, nl };
function known(value) {
  const prefix = value?.trim().toLowerCase().split(/[-_]/)[0];
  return prefix === "en" || prefix === "nl" ? prefix : void 0;
}
export function pickLocale({ forced, i18nLocale, htmlLang }) {
  return known(forced) ?? known(i18nLocale) ?? known(htmlLang) ?? "en";
}
export function mergeTexts(base, overrides) {
  if (!overrides) return base;
  return { ...base, ...overrides, table: { ...base.table, ...overrides.table } };
}
export function localize(value, locale) {
  if (typeof value === "string") return value;
  return value[locale] ?? value.en ?? Object.values(value)[0] ?? "";
}
