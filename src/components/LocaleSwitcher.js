"use client";

import {
  useTransition,
  useState,
  useEffect,
  useRef,
  useCallback,
  useContext,
} from "react";
import { useLocale, useTranslations } from "next-intl";
import { locales, localeMap, LOCALE_COOKIE_NAME } from "@/i18n/config";
import { IconLanguage } from "@tabler/icons-react";
import { AuthContext } from "@/app/AuthContext";
import axios from "axios";

export default function LocaleSwitcher({
  showLabel = false,
  className = "",
  dropDirection = "down",
  useFixed = false,
}) {
  const currentLocale = useLocale();
  const t = useTranslations("locale");
  const { user, loading } = useContext(AuthContext);

  const [isPending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);
  const [fixedPos, setFixedPos] = useState({ top: 0, left: 0 });

  const ref = useRef(null);
  const btnRef = useRef(null);
  const dropdownRef = useRef(null);

  // 🔐 Prevent duplicate calls
  const isUpdatingRef = useRef(false);
  const hasSyncedRef = useRef(false);

  // 🔁 mappings
  const languageToLocaleMap = {
    english: "en",
    hindi: "hi",
    bengali: "bn",
  };

  const localeToLanguageMap = {
    en: "english",
    hi: "hindi",
    bn:"bengali",
  };

  // ==================================================
  // 🌐 AUTO SYNC (ONLY ON LOAD)
  // ==================================================
  useEffect(() => {
    if (hasSyncedRef.current) return;

    if (!loading && user?.language) {
      const mappedLocale =
        languageToLocaleMap[user.language.toLowerCase()];

      if (mappedLocale && mappedLocale !== currentLocale) {
        hasSyncedRef.current = true;

        document.cookie = `${LOCALE_COOKIE_NAME}=${mappedLocale};path=/;max-age=31536000;SameSite=Lax`;
        window.location.reload();
      }
    }
  }, [user, loading]);

  // ==================================================
  // 🌐 SWITCH LOCALE (API + COOKIE)
  // ==================================================
  async function switchLocale(nextLocale) {
    if (nextLocale === currentLocale || isUpdatingRef.current) {
      setOpen(false);
      return;
    }

    isUpdatingRef.current = true;

    const language = localeToLanguageMap[nextLocale];
    console.log(language)
    try {
      // ✅ SAME PATTERN AS YOUR PROFILE UPDATE
      await axios.put(
        `/api/profile`,
        { language },
        { withCredentials: true }
      );
    } catch (err) {
      console.error("Failed to update language", err);
    }

    // ✅ Update cookie
    document.cookie = `${LOCALE_COOKIE_NAME}=${nextLocale};path=/;max-age=31536000;SameSite=Lax`;

    // ✅ Reload UI
    startTransition(() => {
      window.location.reload();
    });
  }

  // 🔒 Close on outside click
  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // 📐 Smart positioning
  useEffect(() => {
    if (open && useFixed && dropdownRef.current && btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect();
      const dropdownWidth = dropdownRef.current.offsetWidth;

      let left = rect.right - dropdownWidth;

      if (left < 8) left = 8;
      if (left + dropdownWidth > window.innerWidth - 8) {
        left = window.innerWidth - dropdownWidth - 8;
      }

      const top =
        dropDirection === "up"
          ? rect.top - 8
          : rect.bottom + 8;

      setFixedPos({ top, left });
    }
  }, [open, useFixed, dropDirection]);

  const toggleDropdown = useCallback(() => {
    setOpen((v) => !v);
  }, []);

  const current = localeMap[currentLocale];

  const dropdownBaseClass =
    "w-48 bg-white rounded-xl shadow-xl overflow-hidden";

  const dropdownAbsoluteClass = `absolute right-0 z-[9999] ${
    dropDirection === "up" ? "bottom-full mb-2" : "top-full mt-2"
  }`;

  const dropdownFixedClass = "fixed z-[9999]";

  return (
    <div ref={ref} className={`relative inline-block ${className}`}>
      {/* 🔘 Button */}
      <button
        ref={btnRef}
        type="button"
        onClick={toggleDropdown}
        disabled={isPending}
        aria-label={t("switchLanguage")}
        title={t("switchLanguage")}
        className={`
          flex items-center gap-2 px-3 py-2 rounded-lg
          text-sm font-medium transition-all
          hover:border-white hover:border rounded-xl text-white
          ${isPending ? "opacity-50 cursor-wait" : "cursor-pointer"}
        `}
      >
        <IconLanguage className="h-5 w-5" />
        {showLabel && (
          <span>
            {current.flag} {current.label}
          </span>
        )}
      </button>

      {/* 📦 Dropdown */}
      {open && (
        <div
          ref={dropdownRef}
          className={`${dropdownBaseClass} ${
            useFixed ? dropdownFixedClass : dropdownAbsoluteClass
          }`}
          style={
            useFixed
              ? {
                  top: fixedPos.top,
                  left: fixedPos.left,
                  transform:
                    dropDirection === "up"
                      ? "translateY(-100%)"
                      : "none",
                }
              : undefined
          }
        >
          {locales.map((loc) => {
            const meta = localeMap[loc];
            const isActive = loc === currentLocale;

            return (
              <button
                key={loc}
                onClick={() => switchLocale(loc)}
                className={`
                  w-full flex items-center gap-3 px-4 py-1 text-xs
                  transition-colors text-left
                  ${
                    isActive
                      ? "bg-[#ff8000] text-white font-semibold"
                      : `${user?.color?"hover:bg-green-50":"hover:bg-orange-50"} text-gray-700`
                  }
                `}
                style={isActive ? { backgroundColor: user?.color || "#ff7f10" } : {}}
              >
                <span className="text-lg">{meta.flag}</span>
                <span>{meta.label}</span>
                {isActive && (
                  <span className="ml-auto text-xs opacity-75">✓</span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
