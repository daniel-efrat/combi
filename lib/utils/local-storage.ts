import { WhisperResponse } from "@/lib/config/whisper"

interface StoredTranscription {
  transcription: WhisperResponse
  language: string
  timestamp: number
  fileName: string
}

const STORAGE_KEY = "saved_transcriptions"

export function saveTranscription(
  transcription: WhisperResponse,
  language: string,
  fileName: string
): void {
  try {
    const stored = getStoredTranscriptions()
    const newItem: StoredTranscription = {
      transcription,
      language,
      timestamp: Date.now(),
      fileName,
    }

    stored.unshift(newItem) // Add new transcription at the beginning

    // Keep only the last 10 transcriptions
    const updatedStored = stored.slice(0, 10)

    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedStored))
  } catch (error) {
    console.error("Failed to save transcription to local storage:", error)
  }
}

export function getStoredTranscriptions(): StoredTranscription[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : []
  } catch (error) {
    console.error("Failed to get transcriptions from local storage:", error)
    return []
  }
}

export function clearStoredTranscriptions(): void {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch (error) {
    console.error("Failed to clear transcriptions from local storage:", error)
  }
}
