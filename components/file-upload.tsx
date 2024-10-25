"use client";

import { useState } from "react";
import { Upload, Mic, Youtube, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { validateFile } from "@/lib/utils/file-processing";
import { TranscriptionResponse } from "@/lib/types";

interface FileUploadProps {
  onTranscriptionComplete: (transcription: TranscriptionResponse) => void;
}

export function FileUpload({ onTranscriptionComplete }: FileUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);
  const { toast } = useToast();

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const error = validateFile(file);
    if (error) {
      toast({
        title: "Error",
        description: error,
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/transcribe", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to transcribe file");
      }

      const transcription: TranscriptionResponse = await response.json();
      onTranscriptionComplete(transcription);
      
      toast({
        title: "Success",
        description: "File transcribed successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to process file",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleYoutubeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!youtubeUrl) return;

    setIsUploading(true);
    try {
      const response = await fetch("/api/transcribe/youtube", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url: youtubeUrl }),
      });

      if (!response.ok) {
        throw new Error("Failed to process YouTube video");
      }

      const transcription: TranscriptionResponse = await response.json();
      onTranscriptionComplete(transcription);

      toast({
        title: "Success",
        description: "YouTube video transcribed successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to process YouTube video",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Card className="p-6">
      <Tabs defaultValue="upload" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="upload">File Upload</TabsTrigger>
          <TabsTrigger value="youtube">YouTube URL</TabsTrigger>
          <TabsTrigger value="record">Record Audio</TabsTrigger>
        </TabsList>

        <TabsContent value="upload">
          <div className="mt-4">
            <label
              htmlFor="file-upload"
              className="flex min-h-[200px] cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/25 px-6 py-10 transition-colors hover:border-primary/50"
            >
              {isUploading ? (
                <div className="flex flex-col items-center">
                  <Loader2 className="h-10 w-10 animate-spin text-primary" />
                  <p className="mt-2 text-sm text-muted-foreground">
                    Processing... {uploadProgress}%
                  </p>
                </div>
              ) : (
                <>
                  <Upload className="h-10 w-10 text-muted-foreground" />
                  <p className="mt-2 text-sm text-muted-foreground">
                    Drag and drop or click to upload audio/video files
                  </p>
                </>
              )}
              <input
                id="file-upload"
                type="file"
                className="hidden"
                accept="audio/*,video/*"
                onChange={handleFileUpload}
                disabled={isUploading}
              />
            </label>
          </div>
        </TabsContent>

        <TabsContent value="youtube">
          <form onSubmit={handleYoutubeSubmit} className="mt-4 space-y-4">
            <div className="flex gap-2">
              <Input
                type="url"
                placeholder="Paste YouTube URL here"
                value={youtubeUrl}
                onChange={(e) => setYoutubeUrl(e.target.value)}
                className="flex-1"
                disabled={isUploading}
              />
              <Button type="submit" disabled={isUploading || !youtubeUrl}>
                {isUploading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Youtube className="mr-2 h-4 w-4" />
                )}
                Process
              </Button>
            </div>
          </form>
        </TabsContent>

        <TabsContent value="record">
          <div className="mt-4 flex flex-col items-center justify-center space-y-4">
            <Button
              size="lg"
              variant="outline"
              className="h-24 w-24 rounded-full"
              disabled={isUploading}
            >
              <Mic className="h-8 w-8" />
            </Button>
            <p className="text-sm text-muted-foreground">
              Click to start recording
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </Card>
  );
}