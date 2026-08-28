export function parseConsent(value) {
  if (!value) return null;
  const sep = value.indexOf(":");
  if (sep === -1) return null;
  const state = value.slice(0, sep);
  if (state !== "accepted" && state !== "rejected") return null;
  const at = new Date(value.slice(sep + 1));
  if (Number.isNaN(at.getTime())) return null;
  return { state, at };
}
export function serializeConsent(state, at) {
  return `${state}:${at.toISOString()}`;
}
export function consentCookieString(name, value, attrs) {
  const parts = [
    `${name}=${value ?? ""}`,
    "Path=/",
    "SameSite=Lax",
    `Max-Age=${value === null ? 0 : attrs.maxAgeDays * 86400}`
  ];
  if (attrs.domain) parts.push(`Domain=${attrs.domain}`);
  if (attrs.secure) parts.push("Secure");
  return parts.join("; ");
}
export function readCookie(cookieString, name) {
  for (const part of cookieString.split(";")) {
    const [k, ...rest] = part.trim().split("=");
    if (k === name) return decodeURIComponent(rest.join("="));
  }
  return null;
}
