"use client"

import { useState, useRef } from "react"
import { LanguageSelect } from "@/components/language-select"
import { FileUpload } from "@/components/file-upload"
import { transcribeAudio } from "@/lib/api/openai"
import { TranscriptionDisplay } from "@/components/transcription-display"
import { ProgressWithStages } from "@/components/progress-with-stages"
import { WhisperResponse } from "@/lib/config/whisper"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"
import { Loader } from "@/components/Loader"

const STAGES = [
  { id: "analyzing", label: "analyzing", progress: 0 },
  { id: "compressing", label: "compressing", progress: 0 },
  { id: "splitting", label: "splitting", progress: 0 },
  { id: "transcribing", label: "transcribing", progress: 0 },
  { id: "merging", label: "mergingResults", progress: 0 },
]

export default function Home() {
  const [selectedLanguage, setSelectedLanguage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [currentStage, setCurrentStage] = useState<string>("")
  const [stages, setStages] = useState(STAGES)
  const [transcription, setTranscription] = useState<WhisperResponse | null>(
    null
  )
  const abortControllerRef = useRef<AbortController | null>(null)

  const updateStageProgress = (stageId: string, progress: number) => {
    setStages((current) =>
      current.map((stage) =>
        stage.id === stageId ? { ...stage, progress } : stage
      )
    )
  }

  const handleAbort = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
      abortControllerRef.current = null
      setIsLoading(false)
      setCurrentStage("")
      setStages(STAGES)
    }
  }

  const handleFileUpload = async (file: File) => {
    if (!selectedLanguage) {
      alert("Please select a language first")
      return
    }

    try {
      setIsLoading(true)
      setCurrentStage("analyzing")
      updateStageProgress("analyzing", 100)

      // Create new AbortController for this upload
      abortControllerRef.current = new AbortController()

      const response = await transcribeAudio(
        file,
        selectedLanguage,
        (stage, progress) => {
          setCurrentStage(stage)
          updateStageProgress(stage, progress)
        }
      )

      setTranscription(response)
    } catch (error: any) {
      if (error.name === "AbortError") {
        console.log("Operation aborted by user")
      } else {
        console.error("Error transcribing file:", error)
      }
    } finally {
      setIsLoading(false)
      setCurrentStage("")
      setStages(STAGES)
      abortControllerRef.current = null
    }
  }

  return (
    <main className="container mx-auto p-4">
      <div className="flex flex-col gap-6">
        <div className="flex justify-end">
          <LanguageSelect
            value={selectedLanguage}
            onValueChange={setSelectedLanguage}
          />
        </div>

        <FileUpload
          onFileSelect={handleFileUpload}
          isLoading={isLoading}
          isLanguageSelected={Boolean(selectedLanguage)}
          language={selectedLanguage}
        />

        {isLoading && (
          <div className="relative">
            <Loader />
            <ProgressWithStages
              currentStage={currentStage}
              stages={stages}
              language={selectedLanguage}
            />
            <Button
              variant="destructive"
              size="icon"
              className="absolute top-0 right-0"
              onClick={handleAbort}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}

        {transcription && (
          <TranscriptionDisplay
            transcription={transcription}
            language={selectedLanguage}
          />
        )}
      </div>
    </main>
  )
}
