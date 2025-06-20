import { NextRequest, NextResponse } from 'next/server';
import { analyzeQuery } from '@/services/scoutbot';

export async function POST(request: NextRequest) {
  try {
    const { query } = await request.json();
    
    if (!query || typeof query !== 'string') {
      return NextResponse.json(
        { error: 'Query is required and must be a string' },
        { status: 400 }
      );
    }

    const response = await analyzeQuery(query);
    
    return NextResponse.json(response);
  } catch (error) {
    console.error('ScoutBot API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}