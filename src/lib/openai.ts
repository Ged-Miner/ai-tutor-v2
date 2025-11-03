import OpenAI from 'openai';
import { prisma } from './prisma';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface GenerateResponseParams {
  lessonId: string;
  conversationHistory: Array<{
    role: 'user' | 'assistant';
    content: string;
  }>;
  userMessage: string;
}

export async function generateAIResponse({
  lessonId,
  conversationHistory,
  userMessage,
}: GenerateResponseParams): Promise<string> {
  try {
    // Fetch lesson details for context
    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
      select: {
        title: true,
        summary: true,
        rawTranscript: true,
      },
    });

    if (!lesson) {
      throw new Error('Lesson not found');
    }

    // Fetch active tutor prompt
    // Look for any active prompt with 'tutor' in the name, or fall back to any active prompt
    const systemPrompt = await prisma.systemPrompt.findFirst({
      where: {
        isActive: true,
        name: {
          contains: 'tutor',
        },
      },
      orderBy: {
        updatedAt: 'desc', // Use most recently updated if multiple exist
      },
    });

    // Fallback: if no tutor-specific prompt, use any active prompt
    const fallbackPrompt = systemPrompt || await prisma.systemPrompt.findFirst({
      where: {
        isActive: true,
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });

    const systemMessage = fallbackPrompt?.content || 'You are a helpful AI tutor assistant.';

    console.log(`🎯 Using prompt: ${fallbackPrompt?.name || 'default fallback'} (v${fallbackPrompt?.version || 'N/A'})`);

    // Build context from lesson
    const lessonContext = `
      # Lesson: ${lesson.title}

      ## Lesson Summary:
      ${lesson.summary || 'No summary available.'}

      ## Full Transcript:
      ${lesson.rawTranscript}

      ---
      Use the above lesson content to answer the student's questions. Base your answers on this material.
      `;

    // Build messages array for OpenAI
    const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
      { role: 'system', content: systemMessage },
      { role: 'system', content: lessonContext },
      ...conversationHistory,
      { role: 'user', content: userMessage },
    ];

    // Call OpenAI API
    console.log('🤖 Calling OpenAI API...');
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages,
      temperature: 0.7,
      max_tokens: 500,
    });

    const response = completion.choices[0]?.message?.content;

    if (!response) {
      throw new Error('No response from OpenAI');
    }

    console.log('✅ OpenAI response generated');
    return response;
  } catch (error) {
    console.error('❌ Error generating AI response:', error);
    throw error;
  }
}
