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

    // Fetch system prompt
    const systemPrompt = await prisma.systemPrompt.findFirst({
      where: {
        name: 'default_tutor_prompt',
        isActive: true,
      },
    });

    const systemMessage = systemPrompt?.content || 'You are a helpful AI tutor assistant.';

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
      model: 'gpt-4o-mini', // Using GPT-4o-mini for cost efficiency
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
