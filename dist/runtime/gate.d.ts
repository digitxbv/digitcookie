import type { GatedScript } from '../module.js';
/**
 * Append the gated scripts to `<head>` in order. Idempotent: a second call is a no-op.
 * With `gtm`, the standard loader goes first, followed by the consent push.
 */
export declare function injectScripts(entries: GatedScript[], doc: Document, gtm?: {
    id: string;
}): void;
