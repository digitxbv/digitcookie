import { type ComputedRef } from 'vue';
import { type Locale, type Texts } from '../i18n.js';
export declare function useTexts(): {
    locale: ComputedRef<Locale>;
    t: ComputedRef<Texts>;
};
