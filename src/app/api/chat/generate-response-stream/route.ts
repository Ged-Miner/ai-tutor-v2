import { generateAIResponseStreaming, getChatbotSettings } from '@/lib/openai';

/**
 * POST /api/chat/generate-response-stream
 * Generate AI response with streaming support using Server-Sent Events
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { lessonId, conversationHistory, userMessage } = body;

    if (!lessonId || !userMessage) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Check if streaming is enabled
    const settings = await getChatbotSettings();
    if (!settings.streaming) {
      return new Response(
        JSON.stringify({ error: 'Streaming is not enabled' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Create a readable stream for SSE
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          const generator = generateAIResponseStreaming({
            lessonId,
            conversationHistory: conversationHistory || [],
            userMessage,
          });

          for await (const chunk of generator) {
            // Format as SSE
            const data = JSON.stringify(chunk);
            controller.enqueue(encoder.encode(`data: ${data}\n\n`));
          }

          // Send end signal
          controller.enqueue(encoder.encode('data: [DONE]\n\n'));
          controller.close();
        } catch (error) {
          console.error('Streaming error:', error);
          const errorData = JSON.stringify({ type: 'error', content: 'Failed to generate response' });
          controller.enqueue(encoder.encode(`data: ${errorData}\n\n`));
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    console.error('Error setting up streaming response:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to setup streaming' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
