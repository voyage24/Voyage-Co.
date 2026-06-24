// Display-language preference, worldwide — mirrors lib/currency.ts. This is
// a UI preference only (no site content is actually translated); it's
// stored the same way the chosen currency is, for a consistent experience.
export interface Language {
  code: string;
  name: string;
  nativeName: string;
}

const LANGUAGES_UNSORTED: Language[] = [
  { code: "en", name: "English",    nativeName: "English" },
  { code: "es", name: "Spanish",    nativeName: "Español" },
  { code: "fr", name: "French",     nativeName: "Français" },
  { code: "de", name: "German",     nativeName: "Deutsch" },
  { code: "it", name: "Italian",    nativeName: "Italiano" },
  { code: "pt", name: "Portuguese", nativeName: "Português" },
  { code: "nl", name: "Dutch",      nativeName: "Nederlands" },
  { code: "ru", name: "Russian",    nativeName: "Русский" },
  { code: "uk", name: "Ukrainian",  nativeName: "Українська" },
  { code: "pl", name: "Polish",     nativeName: "Polski" },
  { code: "cs", name: "Czech",      nativeName: "Čeština" },
  { code: "hu", name: "Hungarian",  nativeName: "Magyar" },
  { code: "ro", name: "Romanian",   nativeName: "Română" },
  { code: "el", name: "Greek",      nativeName: "Ελληνικά" },
  { code: "sv", name: "Swedish",    nativeName: "Svenska" },
  { code: "da", name: "Danish",     nativeName: "Dansk" },
  { code: "no", name: "Norwegian",  nativeName: "Norsk" },
  { code: "fi", name: "Finnish",    nativeName: "Suomi" },
  { code: "tr", name: "Turkish",    nativeName: "Türkçe" },
  { code: "ar", name: "Arabic",     nativeName: "العربية" },
  { code: "he", name: "Hebrew",     nativeName: "עברית" },
  { code: "fa", name: "Persian",    nativeName: "فارسی" },
  { code: "ur", name: "Urdu",       nativeName: "اردو" },
  { code: "hi", name: "Hindi",      nativeName: "हिन्दी" },
  { code: "bn", name: "Bengali",    nativeName: "বাংলা" },
  { code: "th", name: "Thai",       nativeName: "ภาษาไทย" },
  { code: "vi", name: "Vietnamese", nativeName: "Tiếng Việt" },
  { code: "id", name: "Indonesian", nativeName: "Bahasa Indonesia" },
  { code: "ms", name: "Malay",      nativeName: "Bahasa Melayu" },
  { code: "tl", name: "Filipino",   nativeName: "Filipino" },
  { code: "zh", name: "Chinese",    nativeName: "中文" },
  { code: "ja", name: "Japanese",   nativeName: "日本語" },
  { code: "ko", name: "Korean",     nativeName: "한국어" },
  { code: "sw", name: "Swahili",    nativeName: "Kiswahili" },
  { code: "mr", name: "Marathi",    nativeName: "मराठी" },
  { code: "gu", name: "Gujarati",   nativeName: "ગુજરાતી" },
];

// Sorted alphabetically by English name, so the language switcher always
// lists options A→Z regardless of the order they were added above.
export const LANGUAGES: Language[] = [...LANGUAGES_UNSORTED].sort((a, b) => a.name.localeCompare(b.name));
