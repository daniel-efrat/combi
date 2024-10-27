"use client"

import { useState, useRef, useEffect } from "react"
import { LanguageSelect } from "@/components/language-select"
import { FileUpload } from "@/components/file-upload"
import { transcribeAudio } from "@/lib/api/openai"
import { TranscriptionDisplay } from "@/components/transcription-display"
import { ProgressWithStages } from "@/components/progress-with-stages"
import { WhisperResponse } from "@/lib/config/whisper"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"
import { Loader } from "@/components/Loader"
import {
  saveTranscription,
  getStoredTranscriptions,
} from "@/lib/utils/local-storage"
import { estimateProcessingTime } from "@/lib/utils/time-estimation"
import { PriceConfirmation } from "@/components/price-confirmation"
import { SplashScreen } from "@/components/splash-screen"
import { AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"

const STAGES = [
  { id: "analyzing", label: "analyzing", progress: 0 },
  { id: "compressing", label: "compressing", progress: 0 },
  { id: "splitting", label: "splitting", progress: 0 },
  { id: "transcribing", label: "transcribing", progress: 0 },
  { id: "merging", label: "mergingResults", progress: 0 },
]

const RTL_LANGUAGES = ["he", "ar"]

export default function Home() {
  const [selectedLanguage, setSelectedLanguage] = useState("")
  const [showSplash, setShowSplash] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [currentStage, setCurrentStage] = useState<string>("")
  const [stages, setStages] = useState(STAGES)
  const [transcription, setTranscription] = useState<WhisperResponse | null>(
    null
  )
  const [currentFileName, setCurrentFileName] = useState<string>("")
  const [fileDuration, setFileDuration] = useState<number | undefined>()
  const [showPriceConfirmation, setShowPriceConfirmation] = useState(false)
  const [pendingFile, setPendingFile] = useState<File | null>(null)
  const abortControllerRef = useRef<AbortController | null>(null)

  // Load last transcription on mount
  useEffect(() => {
    const stored = getStoredTranscriptions()
    if (stored.length > 0) {
      const lastTranscription = stored[0]
      setTranscription(lastTranscription.transcription)
      setSelectedLanguage(lastTranscription.language)
      setCurrentFileName(lastTranscription.fileName)
      setShowSplash(false)
    }
  }, [])

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

  const processFile = async (file: File) => {
    try {
      setIsLoading(true)
      setCurrentStage("analyzing")
      updateStageProgress("analyzing", 100)
      setCurrentFileName(file.name)

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
      // Save to local storage
      saveTranscription(response, selectedLanguage, file.name)
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
      setFileDuration(undefined)
      abortControllerRef.current = null
      setPendingFile(null)
    }
  }

  const handleFileUpload = async (file: File) => {
    if (!selectedLanguage) {
      alert("Please select a language first")
      return
    }

    // Get file duration for estimation
    const audioElement = document.createElement("audio")
    audioElement.src = URL.createObjectURL(file)
    await new Promise((resolve) => {
      audioElement.addEventListener("loadedmetadata", () => {
        console.log("File duration:", audioElement.duration, "seconds")
        setFileDuration(audioElement.duration)
        setPendingFile(file)
        setShowPriceConfirmation(true)
        resolve(null)
      })
    })
  }

  const isRTL = RTL_LANGUAGES.includes(selectedLanguage)

  return (
    <AnimatePresence mode="wait">
      {showSplash ? (
        <SplashScreen
          value={selectedLanguage}
          onValueChange={setSelectedLanguage}
          onComplete={() => setShowSplash(false)}
        />
      ) : (
        <div className="min-h-screen w-full overflow-x-hidden bg-background flex flex-col items-center">
          <main
            className="w-full max-w-3xl px-4 py-8 flex flex-col items-center gap-8"
            dir={isRTL ? "rtl" : "ltr"}
          >
            <div className="w-full flex justify-center">
              <LanguageSelect
                value={selectedLanguage}
                onValueChange={setSelectedLanguage}
              />
            </div>

            <div className="w-full">
              <FileUpload
                onFileSelect={handleFileUpload}
                isLoading={isLoading}
                isLanguageSelected={Boolean(selectedLanguage)}
                language={selectedLanguage}
              />

              {isLoading && (
                <div className="relative w-full">
                  <Loader />
                  <ProgressWithStages
                    currentStage={currentStage}
                    stages={stages}
                    language={selectedLanguage}
                    durationInSeconds={fileDuration}
                  />
                  <Button
                    variant="destructive"
                    size="icon"
                    className={cn(
                      "absolute top-0",
                      isRTL ? "left-0" : "right-0"
                    )}
                    onClick={handleAbort}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}

              {transcription && (
                <div
                  className="w-full"
                  dir={["he", "ar"].includes(selectedLanguage) ? "rtl" : "ltr"}
                >
                  <TranscriptionDisplay
                    transcription={transcription}
                    language={selectedLanguage}
                    fileName={currentFileName}
                  />
                </div>
              )}
            </div>

            <PriceConfirmation
              isOpen={showPriceConfirmation}
              onClose={() => {
                setShowPriceConfirmation(false)
                setPendingFile(null)
                setFileDuration(undefined)
              }}
              onConfirm={() => {
                setShowPriceConfirmation(false)
                if (pendingFile) {
                  processFile(pendingFile)
                }
              }}
              duration={fileDuration || 0}
              fileName={pendingFile?.name || ""}
            />
          </main>
        </div>
      )}
    </AnimatePresence>
  )
}
