export type ConsentState = 'accepted' | 'rejected'

export interface Consent {
  state: ConsentState
  at: Date
}

export interface CookieAttrs {
  maxAgeDays: number
  domain?: string
  secure: boolean
}

/** `accepted:<ISO>` / `rejected:<ISO>` → Consent; anything else → null (not asked). */
export function parseConsent(value: string | null | undefined): Consent | null {
  if (!value) return null
  const sep = value.indexOf(':')
  if (sep === -1) return null
  const state = value.slice(0, sep)
  if (state !== 'accepted' && state !== 'rejected') return null
  const at = new Date(value.slice(sep + 1))
  if (Number.isNaN(at.getTime())) return null
  return { state, at }
}

export function serializeConsent(state: ConsentState, at: Date): string {
  return `${state}:${at.toISOString()}`
}

/** Full `document.cookie` assignment string. `value: null` clears the cookie. */
export function consentCookieString(name: string, value: string | null, attrs: CookieAttrs): string {
  const parts = [
    `${name}=${value ?? ''}`,
    'Path=/',
    'SameSite=Lax',
    `Max-Age=${value === null ? 0 : attrs.maxAgeDays * 86400}`,
  ]
  if (attrs.domain) parts.push(`Domain=${attrs.domain}`)
  if (attrs.secure) parts.push('Secure')
  return parts.join('; ')
}

/** Value of `name` in a `document.cookie` string, or null. */
export function readCookie(cookieString: string, name: string): string | null {
  for (const part of cookieString.split(';')) {
    const [k, ...rest] = part.trim().split('=')
    if (k === name) return decodeURIComponent(rest.join('='))
  }
  return null
}
