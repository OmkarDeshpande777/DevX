import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    // Call backend API
    const backendResponse = await fetch(`${process.env.BACKEND_URL || 'http://localhost:3001'}/api/market-prices/overview`, {
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
    console.error('Market Prices Overview API error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch market overview',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}