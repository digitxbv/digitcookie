const MARKER = "data-digitcookie";
const GRANTED = {
  ad_storage: "granted",
  ad_user_data: "granted",
  ad_personalization: "granted",
  analytics_storage: "granted"
};
export function injectScripts(entries, doc, gtm) {
  if (!entries.length && !gtm) return;
  if (doc.head.querySelector(`script[${MARKER}]`)) return;
  if (gtm) {
    const win = doc.defaultView;
    const dataLayer = win ? win.dataLayer ??= [] : [];
    dataLayer.push({ "gtm.start": Date.now(), event: "gtm.js" });
    append(doc, { src: `https://www.googletagmanager.com/gtm.js?id=${encodeURIComponent(gtm.id)}`, async: true });
    dataLayer.push({ event: "consent_updated" });
    (function gtag(..._args) {
      dataLayer.push(arguments);
    })("consent", "update", GRANTED);
  }
  for (const entry of entries) append(doc, entry);
}
function append(doc, entry) {
  const el = doc.createElement("script");
  el.setAttribute(MARKER, "");
  if ("inline" in entry) {
    el.textContent = entry.inline;
  } else {
    el.src = entry.src;
    if (entry.async) el.async = true;
    if (entry.defer) el.defer = true;
    for (const [k, v] of Object.entries(entry.attrs ?? {})) el.setAttribute(k, v);
  }
  doc.head.appendChild(el);
}
