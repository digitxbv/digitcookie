import { type Ref } from 'vue';
import type { GatedScript } from '../module.js';
import { type ConsentState } from './cookie.js';
export interface ConsentDeps {
    /** Shared state (useState on the Nuxt side). */
    consent: Ref<ConsentState | null>;
    visible: Ref<boolean>;
    options: {
        name: string;
        maxAgeDays: number;
        domain?: string;
    };
    /** Injected into `<head>` once consent is `accepted`; never on `rejected`/`null`. */
    scripts?: GatedScript[];
    gtm?: {
        id: string;
    };
    /** `null` on the server: no cookie writes, no reloads. */
    document: Document | null;
    secure: boolean;
    reload: () => void;
    now?: () => Date;
}
export type AcceptCallback = () => void;
export declare function createConsent(deps: ConsentDeps): {
    consent: Ref<ConsentState | null, ConsentState | null>;
    accepted: import("vue").ComputedRef<boolean>;
    visible: Ref<boolean, boolean>;
    accept: () => void;
    reject: () => void;
    withdraw: () => void;
    open: () => void;
    onAccept: (cb: AcceptCallback) => void;
};
export type CookieConsent = ReturnType<typeof createConsent>;
