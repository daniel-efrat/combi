import { NextResponse } from "next/server"
import { TranscriptionResponse } from "@/lib/types"

export const dynamic = "auto"
export const revalidate = 0

export async function POST(request: Request) {
  try {
    const { url } = await request.json()

    if (!url) {
      return new NextResponse(
        JSON.stringify({
          success: false,
          error: "No YouTube URL provided",
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
          },
        }
      )
    }

    // Validate YouTube URL
    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/
    if (!youtubeRegex.test(url)) {
      return new NextResponse(
        JSON.stringify({
          success: false,
          error: "Invalid YouTube URL",
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
          },
        }
      )
    }

    // Mock response with segments
    const mockTranscription: TranscriptionResponse = {
      text: "This is a sample transcription of the YouTube video.",
      confidence: 0.95,
      duration: 180,
      language: "en",
      segments: [
        {
          id: 1,
          start: 0,
          end: 3.5,
          text: "This is a sample",
        },
        {
          id: 2,
          start: 3.5,
          end: 6.0,
          text: "transcription of the",
        },
        {
          id: 3,
          start: 6.0,
          end: 8.5,
          text: "YouTube video.",
        },
      ],
    }

    return new NextResponse(
      JSON.stringify({
        success: true,
        transcription: mockTranscription,
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      }
    )
  } catch (error) {
    console.error("YouTube processing error:", error)
    return new NextResponse(
      JSON.stringify({
        success: false,
        error: "Failed to process YouTube video",
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      }
    )
  }
}
