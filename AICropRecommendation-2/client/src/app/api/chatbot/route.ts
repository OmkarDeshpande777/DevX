import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { message } = await request.json();
    
    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' }, 
        { status: 400 }
      );
    }

    // Forward the request to the Node.js backend chatbot endpoint
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:3001';
    
    const response = await fetch(`${backendUrl}/api/chatbot`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message }),
    });

    if (!response.ok) {
      throw new Error(`Backend responded with status: ${response.status}`);
    }

    const data = await response.json();
    
    return NextResponse.json({ response: data.response });
    
  } catch (error) {
    console.error('Chatbot API error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        response: 'Sorry, I am having trouble answering right now. Please try again later.' 
      }, 
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { message: 'Chatbot API is running. Use POST to send messages.' },
    { status: 200 }
  );
}