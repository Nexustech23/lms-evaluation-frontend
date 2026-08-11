/**
 * Internationalization Configuration
 *
 * Central config for all supported locales.
 * To add a new language:
 *   1. Add locale code to `locales` array
 *   2. Add display info to `localeMap`
 *   3. Create matching JSON in /src/messages/<locale>.json
 */

export const defaultLocale = "en";

export const locales = ["en", "hi", "bn"];

/** Human-readable metadata for each locale */
export const localeMap = {
  en: { label: "English", flag: "🇬🇧", dir: "ltr" },
  hi: { label: "हिन्दी", flag: "🇮🇳", dir: "ltr" },
bn: { label: "বাংলা", flag: "🇧🇩", dir: "ltr" },
  // Example — adding a new RTL locale later:
  // ar: { label: "العربية", flag: "🇸🇦", dir: "rtl" },
};

export const LOCALE_COOKIE_NAME = "NEXT_LOCALE";
