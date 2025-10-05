import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ commodity: string }> }
) {
  try {
    const { searchParams } = new URL(request.url)
    const queryString = searchParams.toString()
    const { commodity } = await params
    
    // Call backend API
    const backendResponse = await fetch(`${process.env.BACKEND_URL || 'http://localhost:3001'}/api/farmer-market/profit-analysis/${commodity}?${queryString}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    const data = await backendResponse.json()

    if (!backendResponse.ok) {
      throw new Error(data.error || 'Backend request failed')
    }

    return NextResponse.json(data)
    
  } catch (error) {
    console.error('Profit Analysis API error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch profit analysis data',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}