"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  Download,
  Languages,
  MessageSquareText,
  FileText,
  Loader2,
} from "lucide-react";
import { TranscriptionResponse } from "@/lib/types";
import { createSRTContent } from "@/lib/utils/file-processing";
import { useToast } from "@/components/ui/use-toast";

interface TranscriptionDisplayProps {
  transcription?: TranscriptionResponse;
}

export function TranscriptionDisplay({ transcription }: TranscriptionDisplayProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const handleCopyText = async () => {
    if (!transcription?.text) return;

    try {
      await navigator.clipboard.writeText(transcription.text);
      toast({
        title: "Copied",
        description: "Text copied to clipboard",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy text",
        variant: "destructive",
      });
    }
  };

  const handleDownloadSRT = () => {
    if (!transcription) return;

    const srtContent = createSRTContent(transcription);
    const blob = new Blob([srtContent], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "transcription.srt";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <Card className="p-6">
      <Tabs defaultValue="transcription" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="transcription">Transcription</TabsTrigger>
          <TabsTrigger value="translation">Translation</TabsTrigger>
          <TabsTrigger value="summary">Summary</TabsTrigger>
        </TabsList>

        <TabsContent value="transcription">
          <div className="mt-4 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Transcribed Text</h3>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopyText}
                  disabled={!transcription?.text || isProcessing}
                >
                  <FileText className="mr-2 h-4 w-4" />
                  Copy
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDownloadSRT}
                  disabled={!transcription?.segments || isProcessing}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download SRT
                </Button>
              </div>
            </div>
            <div className="rounded-lg border bg-muted/50 p-4">
              {isProcessing ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : transcription?.text ? (
                <p className="whitespace-pre-wrap">{transcription.text}</p>
              ) : (
                <p className="text-muted-foreground">
                  Upload a file or record audio to see the transcription here.
                </p>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="translation">
          <div className="mt-4 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Translated Text</h3>
              <Button variant="outline" size="sm">
                <Languages className="mr-2 h-4 w-4" />
                Select Language
              </Button>
            </div>
            <div className="rounded-lg border bg-muted/50 p-4">
              <p className="text-muted-foreground">
                Transcribe content first to enable translation.
              </p>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="summary">
          <div className="mt-4 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Content Summary</h3>
              <Button variant="outline" size="sm">
                <MessageSquareText className="mr-2 h-4 w-4" />
                Adjust Length
              </Button>
            </div>
            <div className="rounded-lg border bg-muted/50 p-4">
              <p className="text-muted-foreground">
                Transcribe content first to generate a summary.
              </p>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </Card>
  );
}