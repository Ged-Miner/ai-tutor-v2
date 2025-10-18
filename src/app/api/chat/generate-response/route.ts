import { NextResponse } from 'next/server';
import { generateAIResponse } from '@/lib/openai';

/**
 * POST /api/chat/generate-response
 * Generate AI response for a user message
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { lessonId, conversationHistory, userMessage } = body;

    if (!lessonId || !userMessage) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const aiResponse = await generateAIResponse({
      lessonId,
      conversationHistory: conversationHistory || [],
      userMessage,
    });

    return NextResponse.json({ response: aiResponse });
  } catch (error) {
    console.error('Error generating AI response:', error);
    return NextResponse.json(
      { error: 'Failed to generate response' },
      { status: 500 }
    );
  }
}
