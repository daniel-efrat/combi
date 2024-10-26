export const ACCEPTED_FILE_TYPES = {
  "audio/mpeg": [".mp3"],
  "audio/wav": [".wav"],
  "audio/ogg": [".ogg"],
  "video/mp4": [".mp4"],
  "video/webm": [".webm"],
}

export const MAX_FILE_SIZE = 100 * 1024 * 1024 // 100MB
export const CHUNK_SIZE = 25 * 1024 * 1024 // 25MB chunks

export const SUPPORTED_LANGUAGES = [
  { value: "es", label: "Spanish" },
  { value: "fr", label: "French" },
  { value: "de", label: "German" },
  { value: "it", label: "Italian" },
  { value: "pt", label: "Portuguese" },
  { value: "nl", label: "Dutch" },
  { value: "pl", label: "Polish" },
  { value: "ru", label: "Russian" },
  { value: "ja", label: "Japanese" },
  { value: "ko", label: "Korean" },
  { value: "zh", label: "Chinese" },
] as const

export const SUMMARY_LENGTHS = {
  brief: "a concise summary in 2-3 sentences",
  medium: "a detailed summary in 4-5 paragraphs",
  detailed: "a comprehensive summary covering all main points",
} as const
