export interface Language {
  code: string
  name: string
  nativeName: string
}

export const languages: Language[] = [
  { code: "en", name: "English", nativeName: "English" },
  { code: "he", name: "Hebrew", nativeName: "עברית" },
  { code: "es", name: "Spanish", nativeName: "Español" },
  { code: "fr", name: "French", nativeName: "Français" },
  { code: "de", name: "German", nativeName: "Deutsch" },
  // Add more languages as needed
]

export const defaultLanguage: Language = languages[0]
