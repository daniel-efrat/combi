"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { UploadCloud, Link, Mic } from "lucide-react"
import { cn } from "@/lib/utils"
import { getTranslation } from "@/lib/config/translations"
import { MAX_FILE_SIZE } from "@/lib/api/openai"
import { useToast } from "@/components/ui/use-toast"

interface FileUploadProps {
  onFileSelect: (file: File) => void
  isLoading: boolean
  isLanguageSelected: boolean
  language: string
}

export function FileUpload({
  onFileSelect,
  isLoading,
  isLanguageSelected,
  language,
}: FileUploadProps) {
  const [dragActive, setDragActive] = useState(false)
  const { toast } = useToast()
  const t = (key: string) => getTranslation(language || "en", key as any)

  const validateFile = (file: File): boolean => {
    // Remove size check, only validate file type if needed
    return true
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (!isLanguageSelected) {
      toast({
        variant: "destructive",
        description: t("pleaseSelectLanguage"),
      })
      return
    }

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0]
      if (validateFile(file)) {
        onFileSelect(file)
      }
    }
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isLanguageSelected) {
      toast({
        variant: "destructive",
        description: t("pleaseSelectLanguage"),
      })
      e.target.value = ""
      return
    }

    const file = e.target.files?.[0]
    if (file && validateFile(file)) {
      onFileSelect(file)
    }
    e.target.value = "" // Reset input after handling
  }

  return (
    <Tabs defaultValue="upload" className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="upload">{t("uploadTab")}</TabsTrigger>
        <TabsTrigger value="url">{t("urlTab")}</TabsTrigger>
        <TabsTrigger value="record">{t("recordTab")}</TabsTrigger>
      </TabsList>

      <TabsContent value="upload">
        <Card>
          <CardContent className="pt-6">
            <div
              className={cn(
                "relative rounded-lg border-2 border-dashed p-12 text-center transition-all",
                dragActive
                  ? "border-primary bg-secondary/20"
                  : "border-muted-foreground/25",
                !isLanguageSelected && "opacity-50 cursor-not-allowed",
                isLoading && "opacity-50"
              )}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <input
                id="file-upload"
                type="file"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                accept="audio/*,video/*"
                onChange={handleFileInput}
                disabled={isLoading || !isLanguageSelected}
              />

              <div className="flex flex-col items-center gap-4">
                <UploadCloud className="h-10 w-10 text-muted-foreground" />
                <div className="flex flex-col gap-1">
                  {!isLanguageSelected ? (
                    <p className="text-sm font-medium text-muted-foreground">
                      {t("pleaseSelectLanguage")}
                    </p>
                  ) : (
                    <p className="text-sm font-medium">{t("dragAndDrop")}</p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    {t("supportedFormats")}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {t("processingLargeFiles")}
                  </p>
                </div>
                <Button
                  variant="secondary"
                  disabled={isLoading || !isLanguageSelected}
                >
                  {isLoading ? t("uploading") : t("selectFile")}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="url">
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center gap-4 p-8">
              <Link className="h-10 w-10 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                {t("urlUploadSoon")}
              </p>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="record">
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center gap-4 p-8">
              <Mic className="h-10 w-10 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                {t("recordingSoon")}
              </p>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  )
}
