import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { message, userId } = await request.json()

    if (!message) {
      return NextResponse.json(
        { success: false, error: 'Message is required' },
        { status: 400 }
      )
    }

    // Call backend API
    const backendResponse = await fetch(`${process.env.BACKEND_URL || 'http://localhost:3001'}/api/multilingual-chat/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message,
        userId: userId || 'anonymous'
      }),
    })

    if (!backendResponse.ok) {
      const errorData = await backendResponse.json()
      throw new Error(errorData.error || 'Backend request failed')
    }

    const data = await backendResponse.json()
    return NextResponse.json(data)
    
  } catch (error) {
    console.error('Multilingual Chat API error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to process chat request',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    success: true,
    message: 'Multilingual Chat API is running',
    endpoints: {
      chat: 'POST /api/multilingual-chat/chat',
      languages: 'GET /api/multilingual-chat/languages',
      detectLanguage: 'POST /api/multilingual-chat/detect-language'
    }
  })
}