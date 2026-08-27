import type { GatedScript } from '../module'

const MARKER = 'data-digitcookie'
const GRANTED = {
  ad_storage: 'granted',
  ad_user_data: 'granted',
  ad_personalization: 'granted',
  analytics_storage: 'granted',
} as const

/**
 * Append the gated scripts to `<head>` in order. Idempotent: a second call is a no-op.
 * With `gtm`, the standard loader goes first, followed by the consent push.
 */
export function injectScripts(entries: GatedScript[], doc: Document, gtm?: { id: string }): void {
  if (!entries.length && !gtm) return
  if (doc.head.querySelector(`script[${MARKER}]`)) return

  if (gtm) {
    const win = doc.defaultView as (Window & { dataLayer?: unknown[] }) | null
    const dataLayer = win ? (win.dataLayer ??= []) : []
    dataLayer.push({ 'gtm.start': Date.now(), event: 'gtm.js' })
    append(doc, { src: `https://www.googletagmanager.com/gtm.js?id=${encodeURIComponent(gtm.id)}`, async: true })
    dataLayer.push({ event: 'consent_updated' })
    // gtag() is by definition `dataLayer.push(arguments)`.
    ;(function gtag(..._args: unknown[]) { dataLayer.push(arguments) })('consent', 'update', GRANTED)
  }

  for (const entry of entries) append(doc, entry)
}

function append(doc: Document, entry: GatedScript) {
  const el = doc.createElement('script')
  el.setAttribute(MARKER, '')
  if ('inline' in entry) {
    el.textContent = entry.inline
  } else {
    el.src = entry.src
    if (entry.async) el.async = true
    if (entry.defer) el.defer = true
    for (const [k, v] of Object.entries(entry.attrs ?? {})) el.setAttribute(k, v)
  }
  doc.head.appendChild(el)
}
