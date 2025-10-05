// Next.js API route to proxy authentication requests to backend
import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const url = request.nextUrl.pathname;
    
    // Extract the API endpoint from the URL
    const endpoint = url.replace('/api/proxy', '');
    
    console.log(`Proxying request to: ${BACKEND_URL}${endpoint}`);
    console.log('Request body:', body);
    
    const response = await fetch(`${BACKEND_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
    
    const data = await response.json();
    console.log('Backend response:', data);
    
    return NextResponse.json(data, { status: response.status });
    
  } catch (error) {
    console.error('Proxy error:', error);
    return NextResponse.json(
      { status: 'error', message: 'Proxy connection failed' },
      { status: 500 }
    );
  }
}