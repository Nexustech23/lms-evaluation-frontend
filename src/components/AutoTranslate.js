"use client";

import { useState, useEffect, useRef } from "react";
import { useLocale } from "next-intl";
import { defaultLocale } from "@/i18n/config";

/**
 * In-memory cache so the same text isn't translated twice per session.
 * Key: `${locale}::${text}` → translated string
 */
const translationCache = new Map();

/**
 * Translate text using the free MyMemory Translation API.
 * No API key needed. Supports CORS (works client-side).
 * Free tier: 5000 chars/day (anonymous), 50000 chars/day (with email).
 *
 * @param {string} text   - Source text (English)
 * @param {string} from   - Source language code (e.g., "en")
 * @param {string} to     - Target language code (e.g., "hi")
 * @returns {Promise<string>} Translated text
 */
async function translateText(text, from, to) {
  const cacheKey = `${to}::${text}`;
  if (translationCache.has(cacheKey)) {
    return translationCache.get(cacheKey);
  }

  try {
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${from}|${to}`;
    const res = await fetch(url);
    const data = await res.json();

    if (data?.responseData?.translatedText) {
      const translated = data.responseData.translatedText;
      translationCache.set(cacheKey, translated);
      return translated;
    }
  } catch (err) {
    console.warn("[AutoTranslate] Translation failed, using original text:", err);
  }

  return text; // fallback to original
}

/**
 * AutoTranslate — wraps any text and auto-translates it.
 *
 * If the current locale is English (default), it renders the text as-is.
 * For other locales, it calls a free translation API and caches the result.
 *
 * Usage:
 *   <AutoTranslate>Exam Details</AutoTranslate>
 *   <AutoTranslate tag="h1">Welcome to Dashboard</AutoTranslate>
 *   <AutoTranslate from="en">Some English text</AutoTranslate>
 *
 * Props:
 *   children  - The text to translate (must be a plain string)
 *   tag       - Optional HTML tag to wrap with (default: span)
 *   from      - Source language (default: "en")
 *   className - Optional CSS class
 */

export default function AutoTranslate({
  children,
  tag: Tag = "span",
  from = "en",
  className = "",
}) {
  const locale = useLocale();
  const [translated, setTranslated] = useState(children);
  const textRef = useRef(children);

  useEffect(() => {
    // No translation needed for default locale
    if (locale === defaultLocale || locale === from) {
      setTranslated(children);
      return;
    }

    // Only translate plain strings
    if (typeof children !== "string") {
      console.warn("[AutoTranslate] Children must be a plain string, got:", typeof children);
      return;
    }

    let cancelled = false;
    textRef.current = children;

    translateText(children, from, locale).then((result) => {
      if (!cancelled && textRef.current === children) {
        setTranslated(result);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [children, locale, from]);

  return <Tag className={className}>{translated}</Tag>;
}

/**
 * useAutoTranslate — hook version for programmatic use.
 *
 * Usage:
 *   const autoT = useAutoTranslate();
 *   const [label, setLabel] = useState("Loading...");
 *
 *   useEffect(() => {
 *     autoT("Submit Form").then(setLabel);
 *   }, []);
 *
 * @param {string} from - Source language code (default: "en")
 * @returns {(text: string) => Promise<string>} translate function
 */
export function useAutoTranslate(from = "en") {
  const locale = useLocale();

  return async (text) => {
    if (locale === defaultLocale || locale === from) return text;
    return translateText(text, from, locale);
  };
}
