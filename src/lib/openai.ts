import OpenAI from 'openai';
import { prisma } from './prisma';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Default AI settings
const DEFAULT_CHATBOT_SETTINGS = {
  model: 'gpt-5-nano',
  reasoning: 'minimal',
  verbosity: 'medium',
};

// Helper to get chatbot AI settings from database
async function getChatbotSettings() {
  const settings = await prisma.aISettings.findUnique({
    where: { type: 'CHATBOT' },
  });

  return {
    model: settings?.model ?? DEFAULT_CHATBOT_SETTINGS.model,
    reasoning: settings?.reasoning ?? DEFAULT_CHATBOT_SETTINGS.reasoning,
    verbosity: settings?.verbosity ?? DEFAULT_CHATBOT_SETTINGS.verbosity,
  };
}

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

    // Get AI settings from database
    const aiSettings = await getChatbotSettings();
    console.log(`⚙️ Using AI settings: model=${aiSettings.model}, reasoning=${aiSettings.reasoning}, verbosity=${aiSettings.verbosity}`);

    // Build input array for Responses API
    // Responses API uses 'developer' role for system instructions
    const input: Array<{ role: string; content: string }> = [
      { role: 'developer', content: systemMessage },
      { role: 'developer', content: lessonContext },
      // Add conversation history
      ...conversationHistory.map(msg => ({
        role: msg.role === 'user' ? 'user' : 'assistant',
        content: msg.content,
      })),
      // Add the new user message
      { role: 'user', content: userMessage },
    ];

    // Build API call options for Responses API
    // Note: max_output_tokens includes BOTH reasoning tokens AND response tokens
    // GPT-5 models use reasoning by default, so we need more tokens to ensure
    // there's room for the actual response after reasoning
    const apiOptions: Record<string, unknown> = {
      model: aiSettings.model,
      input,
      max_output_tokens: 2000, // Increased to allow for reasoning + response
      // Add verbosity parameter (supported by Responses API)
      text: {
        verbosity: aiSettings.verbosity,
      },
    };

    // Add reasoning parameter
    // When 'none', we explicitly set effort to 'none' to disable reasoning
    // Otherwise the API defaults to 'medium' reasoning
    apiOptions.reasoning = {
      effort: aiSettings.reasoning,
    };

    // Call OpenAI Responses API
    console.log('🤖 Calling OpenAI Responses API...');
    const response = await openai.responses.create(
      apiOptions as Parameters<typeof openai.responses.create>[0]
    ) as OpenAI.Responses.Response;

    // Debug: log the full response structure
    console.log('📦 Response object keys:', Object.keys(response));
    console.log('📦 Response output_text:', response.output_text);
    console.log('📦 Response output:', JSON.stringify(response.output, null, 2));

    // Extract output text from response
    const outputText = response.output_text;

    if (!outputText) {
      console.error('❌ No output_text found. Full response:', JSON.stringify(response, null, 2));
      throw new Error('No response from OpenAI');
    }

    console.log('✅ OpenAI response generated');
    return outputText;
  } catch (error) {
    console.error('❌ Error generating AI response:', error);
    throw error;
  }
}
