import { computed, type Ref } from 'vue'
import type { GatedScript } from '../module'
import { consentCookieString, serializeConsent, type ConsentState } from './cookie'
import { injectScripts } from './gate'

export interface ConsentDeps {
  /** Shared state (useState on the Nuxt side). */
  consent: Ref<ConsentState | null>
  visible: Ref<boolean>
  options: { name: string; maxAgeDays: number; domain?: string }
  /** Injected into `<head>` once consent is `accepted`; never on `rejected`/`null`. */
  scripts?: GatedScript[]
  gtm?: { id: string }
  /** `null` on the server: no cookie writes, no reloads. */
  document: Document | null
  secure: boolean
  reload: () => void
  now?: () => Date
}

export type AcceptCallback = () => void

export function createConsent(deps: ConsentDeps) {
  const { consent, visible, options, document: doc } = deps
  const now = deps.now ?? (() => new Date())
  const attrs = { maxAgeDays: options.maxAgeDays, domain: options.domain, secure: deps.secure }
  const listeners = new Set<AcceptCallback>()

  const accepted = computed(() => consent.value === 'accepted')

  function write(value: string | null) {
    if (doc) doc.cookie = consentCookieString(options.name, value, attrs)
  }

  /** Persist the answer and close the banner; returns whether the visitor had previously accepted. */
  function record(state: ConsentState): boolean {
    const wasAccepted = consent.value === 'accepted'
    write(serializeConsent(state, now()))
    consent.value = state
    visible.value = false
    return wasAccepted
  }

  function inject() {
    if (doc) injectScripts(deps.scripts ?? [], doc, deps.gtm)
  }

  function accept() {
    if (record('accepted')) return
    inject()
    for (const cb of listeners) cb()
  }

  function reject() {
    if (consent.value === 'accepted') write(null)
    if (record('rejected') && doc) deps.reload()
  }

  function open() {
    visible.value = true
  }

  /**
   * Re-apply the answer read from the live cookie. Prerendered pages hydrate `consent` from the
   * build-time payload (always "not asked"), so the client re-reads the cookie once after hydration.
   */
  function sync(state: ConsentState | null) {
    if (state === consent.value) return
    consent.value = state
    visible.value = state === null
    if (state === 'accepted') {
      inject()
      for (const cb of listeners) cb()
    }
  }

  function onAccept(cb: AcceptCallback) {
    listeners.add(cb)
    if (accepted.value) cb()
  }

  // Returning accepted visitor: scripts start on load (the root-mounted banner creates this on every page).
  if (accepted.value) inject()

  return { consent, accepted, visible, accept, reject, withdraw: reject, open, onAccept, sync }
}

export type CookieConsent = ReturnType<typeof createConsent>
