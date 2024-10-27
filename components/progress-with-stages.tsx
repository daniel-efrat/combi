"use client"

import * as React from "react"
import { Progress } from "@/components/ui/progress"
import { getTranslation } from "@/lib/config/translations"
import { estimateProcessingTime } from "@/lib/utils/time-estimation"

interface Stage {
  id: string
  label: string
  progress: number
}

interface ProgressWithStagesProps {
  currentStage: string
  stages: Stage[]
  language: string
  durationInSeconds?: number
}

export function ProgressWithStages({
  currentStage,
  stages,
  language,
  durationInSeconds,
}: ProgressWithStagesProps) {
  const t = (key: string) => getTranslation(language || "en", key as any)
  const currentStageData = stages.find((s) => s.id === currentStage)
  const [timeLeft, setTimeLeft] = React.useState<number | null>(null)
  const [totalProgress, setTotalProgress] = React.useState(0)
  const totalTimeRef = React.useRef<number | null>(null)

  // Initialize countdown and total time when duration is set
  React.useEffect(() => {
    if (durationInSeconds) {
      const estimatedSeconds = Math.ceil((durationInSeconds / 3600) * 150)
      setTimeLeft(estimatedSeconds)
      totalTimeRef.current = estimatedSeconds
      setTotalProgress(0)
    }
  }, [durationInSeconds])

  // Update progress and time left every second
  React.useEffect(() => {
    if (timeLeft === null || !totalTimeRef.current) return

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev === null || prev <= 0) return 0
        return prev - 1
      })

      setTotalProgress((prev) => {
        if (!totalTimeRef.current) return prev
        const elapsed = totalTimeRef.current - (timeLeft - 1)
        return Math.min(100, (elapsed / totalTimeRef.current) * 100)
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [timeLeft])

  function formatTimeLeft(seconds: number): string {
    if (seconds < 60) {
      return `${seconds} seconds remaining`
    }
    const minutes = Math.ceil(seconds / 60)
    return `${minutes} minute${minutes === 1 ? "" : "s"} remaining`
  }

  return (
    <div className="w-full space-y-4">
      {/* Total progress bar */}
      {timeLeft !== null && (
        <div className="space-y-2">
          <Progress
            value={totalProgress}
            className="w-full h-2 transition-all duration-1000 ease-in-out"
          />
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Total progress</span>
            <span>{Math.round(totalProgress)}%</span>
          </div>
          <p className="text-xs text-muted-foreground text-center">
            {formatTimeLeft(timeLeft)}
          </p>
        </div>
      )}

      {/* Stage progress bar */}
      <div className="space-y-2">
        <Progress
          value={currentStageData?.progress || 0}
          className="w-full h-1.5 transition-all duration-500 ease-in-out"
        />
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>{t(currentStageData?.label || "")}</span>
          <span>{currentStageData?.progress.toFixed(0)}%</span>
        </div>
      </div>

      {/* Stage indicators */}
      <div className="flex justify-center gap-2">
        {stages.map((stage) => (
          <div
            key={stage.id}
            className={`h-2 w-2 rounded-full transition-all duration-300 ${
              stage.id === currentStage
                ? "bg-primary scale-125"
                : stages.findIndex((s) => s.id === currentStage) >
                  stages.findIndex((s) => s.id === stage.id)
                ? "bg-primary/50"
                : "bg-muted"
            }`}
          />
        ))}
      </div>
    </div>
  )
}
