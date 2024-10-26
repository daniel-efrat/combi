"use client"

import * as React from "react"
import { Progress } from "@/components/ui/progress"
import { getTranslation } from "@/lib/config/translations"

interface Stage {
  id: string
  label: string
  progress: number
}

interface ProgressWithStagesProps {
  currentStage: string
  stages: Stage[]
  language: string
}

export function ProgressWithStages({
  currentStage,
  stages,
  language,
}: ProgressWithStagesProps) {
  const t = (key: string) => getTranslation(language || "en", key as any)
  const currentStageData = stages.find((s) => s.id === currentStage)

  return (
    <div className="w-full space-y-2">
      <Progress value={currentStageData?.progress || 0} className="w-full" />
      <div className="flex justify-between text-sm text-muted-foreground">
        <span>{t(currentStageData?.label || "")}</span>
        <span>{currentStageData?.progress.toFixed(0)}%</span>
      </div>
      <div className="flex justify-center gap-2">
        {stages.map((stage) => (
          <div
            key={stage.id}
            className={`h-2 w-2 rounded-full ${
              stage.id === currentStage
                ? "bg-primary"
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
