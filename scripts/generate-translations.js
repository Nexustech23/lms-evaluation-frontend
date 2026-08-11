/**
 * Auto-Generate Translation Files
 *
 * Reads src/messages/en.json and auto-translates all values
 * into the target language using the free MyMemory Translation API.
 *
 * Usage:
 *   node scripts/generate-translations.js hi        # Generate Hindi
 *   node scripts/generate-translations.js ta        # Generate Tamil
 *   node scripts/generate-translations.js hi --force # Overwrite existing keys
 *
 * Notes:
 *   - Free API: 5000 chars/day (anonymous), 50000 with email
 *   - Already-translated keys are SKIPPED by default (use --force to overwrite)
 *   - Rate-limited to 1 request per 500ms to avoid API throttling
 */

const fs = require("fs");
const path = require("path");

const MESSAGES_DIR = path.join(__dirname, "..", "src", "messages");
const SOURCE_LOCALE = "en";
const DELAY_MS = 500; // delay between API calls to avoid rate-limiting

// --- Parse CLI args ---
const args = process.argv.slice(2);
const forceOverwrite = args.includes("--force");
const targetLocale = args.find((a) => !a.startsWith("--"));

if (!targetLocale) {
  console.error("❌ Usage: node scripts/generate-translations.js <locale> [--force]");
  console.error("   Example: node scripts/generate-translations.js hi");
  process.exit(1);
}

if (targetLocale === SOURCE_LOCALE) {
  console.error("❌ Target locale cannot be the same as source locale (en)");
  process.exit(1);
}

// --- Helpers ---
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function translateText(text, from, to) {
  const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${from}|${to}`;
  const res = await fetch(url);
  const data = await res.json();

  if (data?.responseData?.translatedText) {
    // MyMemory returns UPPERCASED text sometimes when it can't translate
    const translated = data.responseData.translatedText;
    if (translated === text.toUpperCase()) {
      console.warn(`   ⚠️  Possibly untranslated: "${text}" → "${translated}"`);
    }
    return translated;
  }

  throw new Error(`API returned no translation for: "${text}"`);
}

/**
 * Recursively translate all string values in an object.
 * Preserves {variable} placeholders.
 */
async function translateObject(source, existing, from, to, keyPath = "") {
  const result = {};

  for (const [key, value] of Object.entries(source)) {
    const fullKey = keyPath ? `${keyPath}.${key}` : key;

    if (typeof value === "object" && value !== null) {
      // Recurse into nested objects
      result[key] = await translateObject(
        value,
        existing?.[key] || {},
        from,
        to,
        fullKey
      );
    } else if (typeof value === "string") {
      // Skip if already translated (unless --force)
      if (!forceOverwrite && existing?.[key]) {
        result[key] = existing[key];
        console.log(`   ⏭️  Skipped (exists): ${fullKey}`);
        continue;
      }

      // Preserve {variable} placeholders by replacing them temporarily
      const placeholders = [];
      const cleanText = value.replace(/\{(\w+)\}/g, (match, name) => {
        placeholders.push(match);
        return `__PH${placeholders.length - 1}__`;
      });

      try {
        let translated = await translateText(cleanText, from, to);

        // Restore placeholders
        placeholders.forEach((ph, i) => {
          translated = translated.replace(`__PH${i}__`, ph);
          // Also handle cases where API changes the placeholder format
          translated = translated.replace(new RegExp(`__ph${i}__`, "gi"), ph);
        });

        result[key] = translated;
        console.log(`   ✅ ${fullKey}: "${value}" → "${translated}"`);

        await sleep(DELAY_MS);
      } catch (err) {
        console.error(`   ❌ Failed: ${fullKey} — ${err.message}`);
        result[key] = existing?.[key] || value; // keep existing or fallback to source
      }
    } else {
      result[key] = value;
    }
  }

  return result;
}

// --- Main ---
async function main() {
  const sourcePath = path.join(MESSAGES_DIR, `${SOURCE_LOCALE}.json`);
  const targetPath = path.join(MESSAGES_DIR, `${targetLocale}.json`);

  if (!fs.existsSync(sourcePath)) {
    console.error(`❌ Source file not found: ${sourcePath}`);
    process.exit(1);
  }

  const sourceMessages = JSON.parse(fs.readFileSync(sourcePath, "utf-8"));

  // Load existing translations (to skip already-done keys)
  let existingMessages = {};
  if (fs.existsSync(targetPath)) {
    existingMessages = JSON.parse(fs.readFileSync(targetPath, "utf-8"));
    console.log(`📄 Found existing ${targetLocale}.json — will skip translated keys`);
  }

  console.log(`\n🌐 Translating en → ${targetLocale}...\n`);

  const translated = await translateObject(
    sourceMessages,
    existingMessages,
    SOURCE_LOCALE,
    targetLocale
  );

  fs.writeFileSync(targetPath, JSON.stringify(translated, null, 2) + "\n", "utf-8");
  console.log(`\n✅ Done! Written to: ${targetPath}\n`);
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
