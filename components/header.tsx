import { FileAudio } from "lucide-react";

export function Header() {
  return (
    <header className="text-center">
      <div className="flex items-center justify-center">
        <FileAudio className="h-12 w-12 text-primary" />
      </div>
      <h1 className="mt-4 text-4xl font-bold">AI Transcription App</h1>
      <p className="mt-2 text-lg text-muted-foreground">
        Transcribe, translate, and summarize your audio and video content
      </p>
    </header>
  );
}