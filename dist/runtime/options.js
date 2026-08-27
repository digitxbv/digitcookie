import { useRuntimeConfig } from "#imports";
export function useDigitCookieOptions() {
  return useRuntimeConfig().public.digitcookie;
}
