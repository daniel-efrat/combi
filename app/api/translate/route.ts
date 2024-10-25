import { NextRequest, NextResponse } from 'next/server';
import { translateText } from '@/lib/api/openai';
import { Language } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    const { text, language } = await request.json();

    if (!text || !language) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const translation = await translateText(text, language as Language);
    return NextResponse.json(translation);
  } catch (error) {
    console.error('Translation error:', error);
    return NextResponse.json(
      { error: 'Failed to process translation' },
      { status: 500 }
    );
  }
}