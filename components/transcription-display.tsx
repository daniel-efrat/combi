"use client"

import { useState } from "react"
import { WhisperResponse, WhisperSegment } from "@/lib/config/whisper"
import { formatTimestamp } from "@/lib/utils/format-timestamp"
import { Button } from "@/components/ui/button"
import { Check, Copy, Download } from "lucide-react"
import { saveAs } from "file-saver"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { getTranslation } from "@/lib/config/translations"

interface TranscriptionDisplayProps {
  transcription: WhisperResponse
  language: string
  fileName?: string
}

const RTL_LANGUAGES = ["he", "ar"]

function formatSRT(segments: WhisperSegment[]): string {
  return segments
    .map((segment, index) => {
      const startTime = new Date(segment.start * 1000)
        .toISOString()
        .slice(11, 23)
        .replace(".", ",")
      const endTime = new Date(segment.end * 1000)
        .toISOString()
        .slice(11, 23)
        .replace(".", ",")
      return `${index + 1}\n${startTime} --> ${endTime}\n${segment.text}\n`
    })
    .join("\n")
}

export function TranscriptionDisplay({
  transcription,
  language,
  fileName,
}: TranscriptionDisplayProps) {
  const [copied, setCopied] = useState(false)
  const t = (key: string) => getTranslation(language || "en", key as any)

  if (!transcription) return null

  const isRTL = RTL_LANGUAGES.includes(language)
  const textDirection = isRTL ? "rtl" : "ltr"

  const handleCopy = async () => {
    const text = transcription.segments
      .map(
        (segment) =>
          `[${formatTimestamp(segment.start)} - ${formatTimestamp(
            segment.end
          )}] ${segment.text}`
      )
      .join("\n")
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDownload = (format: "txt" | "srt") => {
    let content: string
    let filename: string

    if (format === "txt") {
      content = transcription.segments
        .map(
          (segment) =>
            `[${formatTimestamp(segment.start)} - ${formatTimestamp(
              segment.end
            )}] ${segment.text}`
        )
        .join("\n")
      filename = "transcription.txt"
    } else {
      content = formatSRT(transcription.segments)
      filename = "transcription.srt"
    }

    const blob = new Blob([content], { type: "text/plain;charset=utf-8" })
    saveAs(blob, filename)
  }

  return (
    <div className="space-y-4" dir={textDirection}>
      {transcription.segments && transcription.segments.length > 0 && (
        <div className="rounded-lg border bg-card p-4">
          {/* Header Section */}
          <div className="flex items-center mb-4">
            {isRTL ? (
              <>
                <div className="flex gap-2 ml-4">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleCopy}
                    title={t("copyToClipboard")}
                  >
                    {copied ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="icon">
                        <Download className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem onClick={() => handleDownload("txt")}>
                        {t("downloadAsTxt")}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDownload("srt")}>
                        {t("downloadAsSrt")}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <div className="flex-1">
                  <h2 className="text-lg font-semibold">{t("segments")}</h2>
                  {fileName && (
                    <p className="text-sm text-muted-foreground">{fileName}</p>
                  )}
                </div>
              </>
            ) : (
              <>
                <div className="flex-1">
                  <h2 className="text-lg font-semibold">{t("segments")}</h2>
                  {fileName && (
                    <p className="text-sm text-muted-foreground">{fileName}</p>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleCopy}
                    title={t("copyToClipboard")}
                  >
                    {copied ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="icon">
                        <Download className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem onClick={() => handleDownload("txt")}>
                        {t("downloadAsTxt")}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDownload("srt")}>
                        {t("downloadAsSrt")}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </>
            )}
          </div>

          {/* Segments Section */}
          <div className="space-y-2">
            {transcription.segments.map((segment: WhisperSegment) => (
              <div
                key={segment.id}
                className="flex gap-4 text-sm border-b last:border-0 pb-2"
              >
                {isRTL ? (
                  <>
                    <p className="flex-1" lang={language}>
                      {segment.text}
                    </p>
                    <span className="text-muted-foreground whitespace-nowrap keep-ltr">
                      {formatTimestamp(segment.start)} -{" "}
                      {formatTimestamp(segment.end)}
                    </span>
                  </>
                ) : (
                  <>
                    <span className="text-muted-foreground whitespace-nowrap keep-ltr">
                      {formatTimestamp(segment.start)} -{" "}
                      {formatTimestamp(segment.end)}
                    </span>
                    <p className="flex-1" lang={language}>
                      {segment.text}
                    </p>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
