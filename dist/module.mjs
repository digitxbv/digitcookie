import { defineNuxtModule, createResolver, addImports, addComponent, addTemplate } from '@nuxt/kit';

const module$1 = defineNuxtModule({
  meta: {
    name: "@digitxbv/digitcookie",
    configKey: "digitcookie",
    compatibility: { nuxt: ">=4.0.0" }
  },
  defaults: {
    enabled: true,
    cookie: {
      name: "digitcookie",
      maxAgeDays: 365
    },
    scripts: [],
    cookies: [],
    texts: {}
  },
  setup(options, nuxt) {
    const { resolve } = createResolver(import.meta.url);
    nuxt.options.build.transpile.push(resolve("./runtime"));
    const htmlLang = nuxt.options.app.head?.htmlAttrs?.lang;
    const base = options;
    const resolved = htmlLang ? { ...base, htmlLang } : base;
    nuxt.options.runtimeConfig.public.digitcookie = resolved;
    addImports({ name: "useCookieConsent", from: resolve("./runtime/composables/useCookieConsent") });
    addComponent({ name: "CookieSettings", filePath: resolve("./runtime/components/CookieSettings.vue") });
    addComponent({ name: "CookieBanner", filePath: resolve("./runtime/components/CookieBanner.vue") });
    if (!options.enabled) {
      return;
    }
    nuxt.hook("app:resolve", (app) => {
      const hostApp = app.mainComponent;
      const banner = resolve("./runtime/components/CookieBanner.vue");
      const wrapper = addTemplate({
        filename: "digitcookie-app.vue",
        write: true,
        getContents: () => [
          "<template>",
          "  <HostApp />",
          "  <CookieBanner />",
          "</template>",
          "",
          '<script setup lang="ts">',
          `import HostApp from ${JSON.stringify(hostApp)}`,
          `import CookieBanner from ${JSON.stringify(banner)}`,
          "<\/script>",
          ""
        ].join("\n")
      });
      app.mainComponent = wrapper.dst;
    });
  }
});

export { module$1 as default };
