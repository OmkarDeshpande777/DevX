import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3001';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, language, userId } = body;

    if (!message || message.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'Message is required' },
        { status: 400 }
      );
    }

    console.log(`🤖 AI Chat Request - Language: ${language || 'auto-detect'}, Message: ${message.substring(0, 50)}...`);

    const response = await fetch(`${BACKEND_URL}/api/ai-chat/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message,
        language,
        userId: userId || 'anonymous'
      }),
    });

    if (!response.ok) {
      throw new Error(`Backend error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    console.log(`✅ AI Response - Language: ${data.data?.detectedLanguage?.name}, Response: ${data.data?.response?.substring(0, 50)}...`);

    return NextResponse.json(data);

  } catch (error) {
    console.error('AI Chat API error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to process chat message',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const response = await fetch(`${BACKEND_URL}/api/ai-chat/languages`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Backend error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error('Languages API error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch supported languages',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}