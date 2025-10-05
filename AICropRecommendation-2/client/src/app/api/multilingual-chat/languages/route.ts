import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // Call backend API
    const backendResponse = await fetch(`${process.env.BACKEND_URL || 'http://localhost:3001'}/api/multilingual-chat/languages`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!backendResponse.ok) {
      const errorData = await backendResponse.json()
      throw new Error(errorData.error || 'Backend request failed')
    }

    const data = await backendResponse.json()
    return NextResponse.json(data)
    
  } catch (error) {
    console.error('Languages API error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch supported languages',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}