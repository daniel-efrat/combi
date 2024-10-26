import OpenAI from "openai"
import {
  TranscriptionResponse,
  TranslationResponse,
  SummaryResponse,
  Language,
  SummaryLength,
} from "../types"
import { SUMMARY_LENGTHS } from "../constants"
import {
  WhisperConfig,
  WhisperResponse,
  WhisperSegment,
} from "@/lib/config/whisper"
import {
  convertToMp3,
  isAudioFile,
  isVideoFile,
  splitAudioFile,
  MAX_CHUNK_SIZE,
} from "@/lib/utils/file-processing"

// Check if we're in a browser environment
const isClient = typeof window !== "undefined"
const apiKey = isClient
  ? process.env.NEXT_PUBLIC_OPENAI_API_KEY
  : process.env.OPENAI_API_KEY

if (!apiKey) {
  throw new Error("OpenAI API key is not configured")
}

const openai = new OpenAI({
  apiKey,
  dangerouslyAllowBrowser: true,
})

// Maximum file size in bytes (25MB)
export const MAX_FILE_SIZE = 25 * 1024 * 1024

function formatBytes(bytes: number): string {
  const sizes = ["Bytes", "KB", "MB", "GB"]
  if (bytes === 0) return "0 Byte"
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  return `${Math.round(bytes / Math.pow(1024, i))} ${sizes[i]}`
}

type ProgressCallback = (stage: string, progress: number) => void

async function compressAudio(
  file: File,
  onProgress: ProgressCallback
): Promise<File> {
  try {
    console.log(`🎵 Starting compression for file: ${file.name}`)
    console.log(`📊 Original size: ${formatBytes(file.size)}`)

    onProgress("compressing", 0)
    const convertedFile = await convertToMp3(file)
    onProgress("compressing", 100)

    console.log(`📊 Compressed size: ${formatBytes(convertedFile.size)}`)
    console.log(
      `📉 Compression ratio: ${(
        (1 - convertedFile.size / file.size) *
        100
      ).toFixed(1)}%`
    )

    return convertedFile
  } catch (error) {
    console.error("❌ Audio compression error:", error)
    throw error
  }
}

async function transcribeChunk(
  chunk: File,
  language: string,
  chunkIndex: number,
  totalChunks: number,
  onProgress: ProgressCallback
): Promise<WhisperResponse> {
  try {
    console.log(`🔄 Processing chunk ${chunkIndex + 1}/${totalChunks}`)
    console.log(`📊 Chunk size: ${formatBytes(chunk.size)}`)

    const formData = new FormData()
    formData.append("file", chunk)
    formData.append("model", "whisper-1")
    formData.append("response_format", "verbose_json")
    if (language) formData.append("language", language)

    console.log(`🌐 Sending request to OpenAI API for chunk ${chunkIndex + 1}`)
    const startTime = Date.now()

    try {
      const response = await fetch(
        "https://api.openai.com/v1/audio/transcriptions",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            // Remove CORS headers from client request
          },
          // Remove credentials and mode
          body: formData,
        }
      )

      const endTime = Date.now()
      console.log(`⏱️ API call took ${(endTime - startTime) / 1000}s`)

      if (!response.ok) {
        const errorText = await response.text()
        console.error(`❌ API error response:`, errorText)

        // Parse error if possible
        try {
          const errorJson = JSON.parse(errorText)
          throw new Error(
            errorJson.error?.message ||
              `Transcription failed: ${response.statusText}`
          )
        } catch {
          throw new Error(
            `Transcription failed: ${response.statusText}. ${errorText}`
          )
        }
      }

      const data = await response.json()
      const progress = ((chunkIndex + 1) / totalChunks) * 100
      onProgress("transcribing", progress)

      console.log(`✅ Successfully transcribed chunk ${chunkIndex + 1}`)
      return data
    } catch (error) {
      if (error instanceof TypeError && error.message === "Failed to fetch") {
        console.log(
          `🔄 Network error, retrying chunk ${chunkIndex + 1} in 2s...`
        )
        await new Promise((resolve) => setTimeout(resolve, 2000))
        return transcribeChunk(
          chunk,
          language,
          chunkIndex,
          totalChunks,
          onProgress
        )
      }
      throw error
    }
  } catch (error) {
    console.error(`❌ Error transcribing chunk ${chunkIndex}:`, error)
    throw error
  }
}

export async function transcribeAudio(
  file: File,
  language: string,
  onProgress: ProgressCallback
): Promise<WhisperResponse> {
  try {
    console.log(`\n🎬 Starting transcription process for: ${file.name}`)
    console.log(`📊 Initial file size: ${formatBytes(file.size)}`)
    console.log(`🌍 Language: ${language}`)

    // Analysis stage
    onProgress("analyzing", 0)
    const needsCompression =
      file.size > MAX_CHUNK_SIZE ||
      isVideoFile(file) ||
      (isAudioFile(file) && file.type !== "audio/mpeg")
    console.log(`🔍 File type: ${file.type}`)
    console.log(`📝 Needs compression: ${needsCompression}`)
    onProgress("analyzing", 100)

    // Compression stage if needed
    let processedFile: File
    if (needsCompression) {
      console.log("🔄 Starting compression...")
      processedFile = await compressAudio(file, onProgress)
    } else {
      processedFile = file
    }

    // Splitting stage for large files
    onProgress("splitting", 0)
    console.log(`\n📂 Checking if file needs splitting...`)
    console.log(`📊 Processed file size: ${formatBytes(processedFile.size)}`)
    console.log(`📊 Max chunk size: ${formatBytes(MAX_CHUNK_SIZE)}`)

    let chunks: File[]
    if (processedFile.size > MAX_CHUNK_SIZE) {
      console.log("✂️ Splitting file into chunks...")
      chunks = await splitAudioFile(processedFile)
      console.log(`📦 Created ${chunks.length} chunks`)
      chunks.forEach((chunk, index) => {
        console.log(`  Chunk ${index + 1}: ${formatBytes(chunk.size)}`)
      })
    } else {
      chunks = [processedFile]
      console.log("📄 Using single file (no splitting needed)")
    }
    onProgress("splitting", 100)

    // Transcription stage
    console.log("\n🎯 Starting transcription...")
    onProgress("transcribing", 0)
    const results = await Promise.all(
      chunks.map((chunk, index) =>
        transcribeChunk(chunk, language, index, chunks.length, onProgress)
      )
    )

    // Merging stage
    console.log("\n🔄 Merging results...")
    onProgress("merging", 0)
    const mergedResult: WhisperResponse = {
      text: results.map((r) => r.text).join(" "),
      segments: results.flatMap((result, chunkIndex) =>
        result.segments.map((segment: any) => ({
          id: `segment-${chunkIndex}-${segment.id}`,
          start: segment.start + chunkIndex * (30 * 60),
          end: segment.end + chunkIndex * (30 * 60),
          text: segment.text,
        }))
      ),
    }
    onProgress("merging", 100)

    console.log("✅ Transcription complete!")
    console.log(`📝 Total segments: ${mergedResult.segments.length}`)
    console.log(`📊 Total text length: ${mergedResult.text.length} characters`)

    return mergedResult
  } catch (error) {
    console.error("❌ Transcription error:", error)
    throw error
  }
}

export async function translateText(
  text: string,
  targetLanguage: Language
): Promise<TranslationResponse> {
  const response = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [
      {
        role: "system",
        content: `You are a professional translator. Translate the following text to ${targetLanguage} while maintaining the original meaning and tone. Provide only the translation without any additional comments.`,
      },
      {
        role: "user",
        content: text,
      },
    ],
  })

  return {
    text: response.choices[0].message.content || "",
    language: targetLanguage,
  }
}

export async function summarizeText(
  text: string,
  length: SummaryLength
): Promise<SummaryResponse> {
  const response = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [
      {
        role: "system",
        content: `You are an expert at summarizing content. Create ${SUMMARY_LENGTHS[length]} of the following text. Focus on the key points and maintain the original meaning. Provide only the summary without any additional comments.`,
      },
      {
        role: "user",
        content: text,
      },
    ],
  })

  return {
    text: response.choices[0].message.content || "",
    length,
  }
}
