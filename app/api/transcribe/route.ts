import { NextResponse } from "next/server"
import { TranscriptionResponse } from "@/lib/types"
import OpenAI from "openai"
import { writeFile, unlink } from "fs/promises"
import path from "path"
import { randomUUID } from "crypto"
import fs from "fs/promises"
import { createReadStream } from "fs"

// Change the dynamic export to auto
export const dynamic = "force-dynamic"
// Add revalidate
export const revalidate = 0

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: Request) {
  let tempFilePath: string | null = null

  try {
    const formData = await request.formData()
    const file = formData.get("file") as File | null

    if (!file) {
      return NextResponse.json(
        {
          success: false,
          error: "No file provided",
        },
        { status: 400 }
      )
    }

    // Basic file validation
    if (!file.type.startsWith("audio/") && !file.type.startsWith("video/")) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid file type",
        },
        { status: 400 }
      )
    }

    try {
      // Convert File to Buffer
      const bytes = await file.arrayBuffer()
      const buffer = Buffer.from(bytes)

      // Create unique filename
      const uniqueId = randomUUID()
      const ext = path.extname(file.name)
      const tmpDir = path.join(process.cwd(), "tmp")
      tempFilePath = path.join(tmpDir, `${uniqueId}${ext}`)

      // Ensure tmp directory exists
      try {
        await fs.access(tmpDir)
      } catch {
        await fs.mkdir(tmpDir, { recursive: true })
      }

      // Write the file
      await writeFile(tempFilePath, buffer)

      // Create a ReadStream from the file using standard fs
      const fileStream = createReadStream(tempFilePath)

      // Send directly to Whisper API
      const transcription = await openai.audio.transcriptions.create({
        file: fileStream,
        model: "whisper-1",
        response_format: "verbose_json",
        language: "en",
      })

      // Format the response
      const formattedResponse: TranscriptionResponse = {
        text: transcription.text || "",
        confidence: 0.95,
        duration:
          typeof transcription.duration === "string"
            ? parseFloat(transcription.duration)
            : transcription.duration || 0,
        language: transcription.language || "en",
        segments:
          transcription.segments?.map((segment, index) => ({
            id: index + 1,
            start:
              typeof segment.start === "string"
                ? parseFloat(segment.start)
                : segment.start || 0,
            end:
              typeof segment.end === "string"
                ? parseFloat(segment.end)
                : segment.end || 0,
            text: segment.text || "",
          })) || [],
      }

      return NextResponse.json({
        success: true,
        transcription: formattedResponse,
      })
    } catch (error) {
      console.error("Whisper API Error:", error)
      throw new Error("Failed to transcribe audio")
    }
  } catch (error) {
    console.error("API Error:", error)
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to process transcription request",
      },
      { status: 500 }
    )
  } finally {
    // Clean up temp file if it exists
    if (tempFilePath) {
      await unlink(tempFilePath).catch(console.error)
    }
  }
}
