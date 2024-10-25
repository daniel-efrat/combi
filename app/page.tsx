"use client";

import { useState } from "react";
import { FileUpload } from "@/components/file-upload";
import { TranscriptionDisplay } from "@/components/transcription-display";
import { Header } from "@/components/header";
import { TranscriptionResponse } from "@/lib/types";

export default function Home() {
  const [transcription, setTranscription] = useState<TranscriptionResponse>();

  return (
    <main className="min-h-screen bg-gradient-to-b from-background to-muted">
      <div className="container mx-auto px-4 py-8">
        <Header />
        <div className="mt-8 grid gap-8">
          <FileUpload onTranscriptionComplete={setTranscription} />
          <TranscriptionDisplay transcription={transcription} />
        </div>
      </div>
    </main>
  );
}