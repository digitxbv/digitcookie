import { useRuntimeConfig } from '#imports'
import type { ResolvedOptions } from '../module'

/** Typed view of `runtimeConfig.public.digitcookie` (Nuxt's generated type erases the array element types). */
export function useDigitCookieOptions(): ResolvedOptions {
  return useRuntimeConfig().public.digitcookie as unknown as ResolvedOptions
}
