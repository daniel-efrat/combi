export interface TranscriptionSegment {
  id: string
  start: number
  end: number
  text: string
}

export interface TranscriptionResponse {
  text: string
  segments: TranscriptionSegment[]
}

export interface TranslationResponse {
  text: string
  language: Language
}

export interface SummaryResponse {
  text: string
  length: SummaryLength
}

export type Language =
  | "English"
  | "Spanish"
  | "French"
  | "German"
  | "Italian"
  | "Portuguese"
  | "Dutch"
  | "Russian"
  | "Japanese"
  | "Chinese"
  | "Korean"

export type SummaryLength = "brief" | "medium" | "detailed"
