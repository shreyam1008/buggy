import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    tailwindcss(),
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["krishna.png", "icon-192x192.png", "icon-512x512.png"],
      // Enable service worker in development for testing
      devOptions: {
        enabled: true,
      },
      manifest: {
        name: "Nepali Date Converter - BS to AD",
        short_name: "DateConverter",
        description: "Convert dates between English (AD) and Nepali (BS) calendars. Accurate Bikram Sambat to Gregorian date conversion. Works offline!",
        theme_color: "#4f46e5",
        background_color: "#0d0d12",
        display: "standalone",
        orientation: "portrait",
        scope: "/",
        start_url: "/",
        lang: "en",
        dir: "ltr",
        categories: ["utilities", "productivity", "lifestyle"],
        icons: [
          {
            src: "icon-192x192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "icon-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "icon-192x192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "maskable",
          },
          {
            src: "icon-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
        shortcuts: [
          {
            name: "Convert BS to AD",
            short_name: "BS→AD",
            description: "Convert Nepali date to English date",
            url: "/?convert=bs-to-ad",
            icons: [{ src: "icon-192x192.png", sizes: "192x192" }],
          },
          {
            name: "Convert AD to BS",
            short_name: "AD→BS",
            description: "Convert English date to Nepali date",
            url: "/?convert=ad-to-bs",
            icons: [{ src: "icon-192x192.png", sizes: "192x192" }],
          },
        ],
      },
      workbox: {
        // Cache ALL static assets for offline use
        globPatterns: ["**/*.{js,css,html,ico,png,svg,woff2,json}"],
        // Ensure navigation requests fall back to index.html (SPA support)
        navigateFallback: "index.html",
        navigateFallbackDenylist: [/^\/api/],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: "CacheFirst",
            options: {
              cacheName: "google-fonts-cache",
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: "CacheFirst",
            options: {
              cacheName: "google-fonts-webfonts",
              expiration: {
                maxEntries: 30,
                maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
        ],
      },
    }),
  ],
});
