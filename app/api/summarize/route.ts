import { NextRequest, NextResponse } from 'next/server';
import { summarizeText } from '@/lib/api/openai';
import { SummaryLength } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    const { text, length } = await request.json();

    if (!text || !length) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const summary = await summarizeText(text, length as SummaryLength);
    return NextResponse.json(summary);
  } catch (error) {
    console.error('Summarization error:', error);
    return NextResponse.json(
      { error: 'Failed to process summary' },
      { status: 500 }
    );
  }
}