import { computed } from "vue";
import { consentCookieString, serializeConsent } from "./cookie.js";
import { injectScripts } from "./gate.js";
export function createConsent(deps) {
  const { consent, visible, options, document: doc } = deps;
  const now = deps.now ?? (() => /* @__PURE__ */ new Date());
  const attrs = { maxAgeDays: options.maxAgeDays, domain: options.domain, secure: deps.secure };
  const listeners = /* @__PURE__ */ new Set();
  const accepted = computed(() => consent.value === "accepted");
  function write(value) {
    if (doc) doc.cookie = consentCookieString(options.name, value, attrs);
  }
  function record(state) {
    const wasAccepted = consent.value === "accepted";
    write(serializeConsent(state, now()));
    consent.value = state;
    visible.value = false;
    return wasAccepted;
  }
  function inject() {
    if (doc) injectScripts(deps.scripts ?? [], doc, deps.gtm);
  }
  function accept() {
    if (record("accepted")) return;
    inject();
    for (const cb of listeners) cb();
  }
  function reject() {
    if (consent.value === "accepted") write(null);
    if (record("rejected") && doc) deps.reload();
  }
  function open() {
    visible.value = true;
  }
  function onAccept(cb) {
    listeners.add(cb);
    if (accepted.value) cb();
  }
  if (accepted.value) inject();
  return { consent, accepted, visible, accept, reject, withdraw: reject, open, onAccept };
}
