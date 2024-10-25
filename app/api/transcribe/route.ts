import { NextRequest, NextResponse } from 'next/server';
import { transcribeAudio } from '@/lib/api/openai';
import { validateFile, chunkFile } from '@/lib/utils/file-processing';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    const error = validateFile(file);
    if (error) {
      return NextResponse.json({ error }, { status: 400 });
    }

    const chunks = await chunkFile(file);
    const transcriptions = await Promise.all(
      chunks.map((chunk) => transcribeAudio(chunk.chunk))
    );

    // Combine transcriptions in order
    const combinedTranscription = {
      text: transcriptions.map((t) => t.text).join(' '),
      segments: transcriptions.flatMap((t) => t.segments),
    };

    return NextResponse.json(combinedTranscription);
  } catch (error) {
    console.error('Transcription error:', error);
    return NextResponse.json(
      { error: 'Failed to process transcription' },
      { status: 500 }
    );
  }
}