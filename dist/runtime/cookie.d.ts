export type ConsentState = 'accepted' | 'rejected';
export interface Consent {
    state: ConsentState;
    at: Date;
}
export interface CookieAttrs {
    maxAgeDays: number;
    domain?: string;
    secure: boolean;
}
/** `accepted:<ISO>` / `rejected:<ISO>` → Consent; anything else → null (not asked). */
export declare function parseConsent(value: string | null | undefined): Consent | null;
export declare function serializeConsent(state: ConsentState, at: Date): string;
/** Full `document.cookie` assignment string. `value: null` clears the cookie. */
export declare function consentCookieString(name: string, value: string | null, attrs: CookieAttrs): string;
