import { FFmpeg } from "@ffmpeg/ffmpeg"
import { fetchFile } from "@ffmpeg/util"
import { getFFmpeg } from "@/lib/config/ffmpeg-worker"

const ALLOWED_AUDIO_TYPES = new Set([
  "audio/mpeg",
  "audio/mp3",
  "audio/wav",
  "audio/ogg",
  "audio/webm",
])

export const MAX_CHUNK_SIZE = 24 * 1024 * 1024

export async function convertToMp3(file: File): Promise<File> {
  if (file.type === "audio/mpeg") {
    return file
  }

  const ffmpeg = await getFFmpeg()

  try {
    const inputName = `input.${file.name.split(".").pop()}`
    const outputName = "output.mp3"

    console.log("Writing input file...")
    await ffmpeg.writeFile(inputName, await fetchFile(file))

    console.log("Converting to MP3...")
    if (file.type.startsWith("video/")) {
      await ffmpeg.exec([
        "-i",
        inputName,
        "-vn", // Skip video
        "-acodec",
        "libmp3lame",
        "-ar",
        "16000", // 16kHz sample rate
        "-ac",
        "1", // mono
        "-b:a",
        "64k", // Lower bitrate for smaller files
        "-f",
        "mp3", // force format
        outputName,
      ])
    } else {
      await ffmpeg.exec([
        "-i",
        inputName,
        "-acodec",
        "libmp3lame",
        "-ar",
        "16000",
        "-ac",
        "1",
        "-b:a",
        "64k",
        "-f",
        "mp3",
        outputName,
      ])
    }

    console.log("Reading output file...")
    const data = await ffmpeg.readFile(outputName)
    const blob = new Blob([data], { type: "audio/mpeg" })
    const convertedFile = new File([blob], "audio.mp3", {
      type: "audio/mpeg",
      lastModified: Date.now(),
    })

    console.log("Cleaning up...")
    await ffmpeg.deleteFile(inputName)
    await ffmpeg.deleteFile(outputName)

    console.log(`Converted file size: ${convertedFile.size} bytes`)
    return convertedFile
  } catch (error: any) {
    console.error("FFmpeg processing error:", error)
    throw new Error(`Failed to convert audio format: ${error.message}`)
  }
}

async function createAudioBuffer(file: File): Promise<AudioBuffer> {
  const arrayBuffer = await file.arrayBuffer()
  const audioContext = new (window.AudioContext || window.webkitAudioContext)()
  return await audioContext.decodeAudioData(arrayBuffer)
}

async function audioBufferToFile(
  buffer: AudioBuffer,
  startTime: number,
  duration: number
): Promise<File> {
  const offlineContext = new OfflineAudioContext(
    1,
    Math.ceil(duration * buffer.sampleRate),
    buffer.sampleRate
  )

  const source = offlineContext.createBufferSource()
  source.buffer = buffer
  source.connect(offlineContext.destination)
  source.start(0, startTime, duration)

  const renderedBuffer = await offlineContext.startRendering()
  const wavBlob = await audioBufferToWav(renderedBuffer)

  return new File([wavBlob], `chunk_${startTime}.wav`, {
    type: "audio/wav",
    lastModified: Date.now(),
  })
}

export async function splitAudioFile(file: File): Promise<File[]> {
  try {
    console.log("Creating audio buffer...")
    const audioBuffer = await createAudioBuffer(file)
    const duration = audioBuffer.duration
    console.log(`Total duration: ${duration} seconds`)

    const chunkDuration = 300 // 5 minutes
    const numChunks = Math.ceil(duration / chunkDuration)
    const chunks: File[] = []

    for (let i = 0; i < numChunks; i++) {
      const start = i * chunkDuration
      const length = Math.min(chunkDuration, duration - start)

      console.log(
        `Processing chunk ${i + 1}/${numChunks} (${start}s to ${
          start + length
        }s)`
      )
      const chunkFile = await audioBufferToFile(audioBuffer, start, length)

      // Convert chunk to MP3
      const mp3Chunk = await convertToMp3(chunkFile)
      console.log(
        `Chunk ${i + 1} size: ${Math.round(mp3Chunk.size / 1024 / 1024)}MB`
      )
      chunks.push(mp3Chunk)
    }

    console.log(`Successfully created ${chunks.length} chunks`)
    return chunks
  } catch (error) {
    console.error("Error splitting audio:", error)
    throw error
  }
}

// Helper function to convert AudioBuffer to WAV format
function audioBufferToWav(buffer: AudioBuffer): Promise<Blob> {
  const numChannels = buffer.numberOfChannels
  const sampleRate = buffer.sampleRate
  const format = 1 // PCM
  const bitDepth = 16
  const bytesPerSample = bitDepth / 8
  const blockAlign = numChannels * bytesPerSample
  const byteRate = sampleRate * blockAlign
  const dataSize = buffer.length * blockAlign
  const headerSize = 44
  const totalSize = headerSize + dataSize
  const arrayBuffer = new ArrayBuffer(totalSize)
  const view = new DataView(arrayBuffer)

  // Write WAV header
  writeString(view, 0, "RIFF")
  view.setUint32(4, totalSize - 8, true)
  writeString(view, 8, "WAVE")
  writeString(view, 12, "fmt ")
  view.setUint32(16, 16, true)
  view.setUint16(20, format, true)
  view.setUint16(22, numChannels, true)
  view.setUint32(24, sampleRate, true)
  view.setUint32(28, byteRate, true)
  view.setUint16(32, blockAlign, true)
  view.setUint16(34, bitDepth, true)
  writeString(view, 36, "data")
  view.setUint32(40, dataSize, true)

  // Write audio data
  const channelData = buffer.getChannelData(0)
  let offset = 44
  for (let i = 0; i < buffer.length; i++) {
    const sample = Math.max(-1, Math.min(1, channelData[i]))
    view.setInt16(offset, sample * 0x7fff, true)
    offset += 2
  }

  return Promise.resolve(new Blob([arrayBuffer], { type: "audio/wav" }))
}

function writeString(view: DataView, offset: number, string: string) {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i))
  }
}

export function isAudioFile(file: File): boolean {
  return ALLOWED_AUDIO_TYPES.has(file.type) || file.type.startsWith("audio/")
}

export function isVideoFile(file: File): boolean {
  return file.type.startsWith("video/")
}
