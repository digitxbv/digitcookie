import { computed, type Ref } from 'vue'
import { consentCookieString, serializeConsent, type ConsentState } from './cookie'

export interface ConsentDeps {
  /** Shared state (useState on the Nuxt side). */
  consent: Ref<ConsentState | null>
  visible: Ref<boolean>
  options: { name: string; maxAgeDays: number; domain?: string }
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

  function accept() {
    if (record('accepted')) return
    // TODO(ticket 09): inject gated scripts here, before host callbacks.
    for (const cb of listeners) cb()
  }

  function reject() {
    if (consent.value === 'accepted') write(null)
    if (record('rejected') && doc) deps.reload()
  }

  function open() {
    visible.value = true
  }

  function onAccept(cb: AcceptCallback) {
    listeners.add(cb)
    if (accepted.value) cb()
  }

  return { consent, accepted, visible, accept, reject, withdraw: reject, open, onAccept }
}

export type CookieConsent = ReturnType<typeof createConsent>
