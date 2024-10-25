import OpenAI from 'openai';
import { TranscriptionResponse, TranslationResponse, SummaryResponse, Language, SummaryLength } from '../types';
import { SUMMARY_LENGTHS } from '../constants';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function transcribeAudio(
  audioFile: File | Blob
): Promise<TranscriptionResponse> {
  const formData = new FormData();
  formData.append('file', audioFile);
  formData.append('model', 'whisper-1');
  formData.append('response_format', 'verbose_json');

  const response = await openai.audio.transcriptions.create({
    file: audioFile,
    model: 'whisper-1',
    response_format: 'verbose_json',
  });

  return {
    text: response.text,
    segments: response.segments.map((segment) => ({
      start: segment.start,
      end: segment.end,
      text: segment.text,
    })),
  };
}

export async function translateText(
  text: string,
  targetLanguage: Language
): Promise<TranslationResponse> {
  const response = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [
      {
        role: 'system',
        content: `You are a professional translator. Translate the following text to ${targetLanguage} while maintaining the original meaning and tone. Provide only the translation without any additional comments.`,
      },
      {
        role: 'user',
        content: text,
      },
    ],
  });

  return {
    text: response.choices[0].message.content || '',
    language: targetLanguage,
  };
}

export async function summarizeText(
  text: string,
  length: SummaryLength
): Promise<SummaryResponse> {
  const response = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [
      {
        role: 'system',
        content: `You are an expert at summarizing content. Create ${SUMMARY_LENGTHS[length]} of the following text. Focus on the key points and maintain the original meaning. Provide only the summary without any additional comments.`,
      },
      {
        role: 'user',
        content: text,
      },
    ],
  });

  return {
    text: response.choices[0].message.content || '',
    length,
  };
}