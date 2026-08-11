import { getRequestConfig } from "next-intl/server";
import { cookies } from "next/headers";
import { defaultLocale, locales, LOCALE_COOKIE_NAME } from "./config";

export default getRequestConfig(async () => {
  // Read locale from cookie; fall back to default
  const cookieStore = await cookies();
  let locale = cookieStore.get(LOCALE_COOKIE_NAME)?.value;

  // Validate — reject unknown locales
  if (!locale || !locales.includes(locale)) {
    locale = defaultLocale;
  }

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  };
});
