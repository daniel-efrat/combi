export interface WhisperSegment {
  id: string
  start: number
  end: number
  text: string
}

export interface WhisperResponse {
  text: string
  segments: WhisperSegment[]
}

export interface WhisperConfig {
  language?: string
  task?: "transcribe" | "translate"
  prompt?: string
  response_format?: "json" | "text" | "srt" | "verbose_json" | "vtt"
  temperature?: number
  timestamp_granularities?: Array<"segment" | "word">
}

export const defaultWhisperConfig: WhisperConfig = {
  response_format: "verbose_json",
  temperature: 0,
  timestamp_granularities: ["segment"],
}
