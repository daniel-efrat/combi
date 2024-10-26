import { FFmpeg } from "@ffmpeg/ffmpeg"
import { toBlobURL } from "@ffmpeg/util"

let ffmpegInstance: FFmpeg | null = null

export async function getFFmpeg(): Promise<FFmpeg> {
  if (ffmpegInstance?.loaded) {
    return ffmpegInstance
  }

  ffmpegInstance = new FFmpeg()

  if (!ffmpegInstance.loaded) {
    try {
      // Use local files from public directory
      await ffmpegInstance.load({
        coreURL: await toBlobURL("/ffmpeg-core.js", "text/javascript", {
          type: "module",
        }),
        wasmURL: await toBlobURL("/ffmpeg-core.wasm", "application/wasm"),
      })

      console.log("✅ FFmpeg loaded successfully")
    } catch (error) {
      console.error("❌ Failed to load FFmpeg:", error)
      ffmpegInstance = null
      throw error
    }
  }

  return ffmpegInstance
}

export function disposeFFmpeg() {
  if (ffmpegInstance) {
    ffmpegInstance = null
  }
}
