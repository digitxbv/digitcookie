import { useRuntimeConfig } from '#imports'
import type { ModuleOptions } from '../module'

/** Typed view of `runtimeConfig.public.digitcookie` (Nuxt's generated type erases the array element types). */
export function useDigitCookieOptions(): ModuleOptions {
  return useRuntimeConfig().public.digitcookie as unknown as ModuleOptions
}
