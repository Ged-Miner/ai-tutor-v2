import OpenAI from 'openai';
import { prisma } from '@/lib/prisma';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Default AI settings for transcript summarization
const DEFAULT_TRANSCRIPT_SETTINGS = {
  model: 'gpt-5-nano',
  reasoning: 'minimal',
  verbosity: 'medium',
};

// Helper to get transcript AI settings from database
async function getTranscriptSettings() {
  const settings = await prisma.aISettings.findUnique({
    where: { type: 'TRANSCRIPT' },
  });

  return {
    model: settings?.model ?? DEFAULT_TRANSCRIPT_SETTINGS.model,
    reasoning: settings?.reasoning ?? DEFAULT_TRANSCRIPT_SETTINGS.reasoning,
    verbosity: settings?.verbosity ?? DEFAULT_TRANSCRIPT_SETTINGS.verbosity,
  };
}

/**
 * Generate a lesson summary from a raw transcript using OpenAI
 * @param transcript - The raw transcript text
 * @param lessonTitle - The title of the lesson
 * @returns The generated summary in markdown format
 */
export async function generateLessonSummary(
  transcript: string,
  lessonTitle: string
): Promise<string> {
  try {
    // Fetch the system prompt from database
    const systemPromptRecord = await prisma.systemPrompt.findFirst({
      where: {
        name: 'transcript_summarizer_prompt',
        isActive: true,
      },
    });

    if (!systemPromptRecord) {
      throw new Error('System prompt for transcript summarization not found');
    }

    // Get AI settings from database
    const aiSettings = await getTranscriptSettings();
    console.log(`⚙️ Transcript AI settings: model=${aiSettings.model}, reasoning=${aiSettings.reasoning}, verbosity=${aiSettings.verbosity}`);

    // Build input array for Responses API
    // Responses API uses 'developer' role for system instructions
    const input: Array<{ role: string; content: string }> = [
      { role: 'developer', content: systemPromptRecord.content },
      { role: 'user', content: `Lesson Title: ${lessonTitle}\n\nTranscript:\n${transcript}` },
    ];

    // Build API call options for Responses API
    // Note: max_output_tokens includes BOTH reasoning tokens AND response tokens
    const apiOptions: Record<string, unknown> = {
      model: aiSettings.model,
      input,
      max_output_tokens: 4000, // Summaries need more tokens (reasoning + response)
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
    console.log('🤖 Calling OpenAI Responses API for summary...');
    const response = await openai.responses.create(
      apiOptions as Parameters<typeof openai.responses.create>[0]
    ) as OpenAI.Responses.Response;

    // Extract output text from response
    const summary = response.output_text;

    if (!summary) {
      throw new Error('OpenAI returned empty response');
    }

    console.log('✅ Summary generated successfully');
    return summary.trim();
  } catch (error) {
    console.error('Error generating lesson summary:', error);
    throw error;
  }
}

/**
 * Update a lesson with its generated summary
 * This is called after a lesson is created from a pending transcript
 * @param lessonId - The ID of the lesson to update
 */
export async function generateAndUpdateLessonSummary(
  lessonId: string
): Promise<void> {
  try {
    // Fetch the lesson
    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
      select: {
        id: true,
        title: true,
        rawTranscript: true,
        summary: true,
      },
    });

    if (!lesson) {
      throw new Error(`Lesson not found: ${lessonId}`);
    }

    // Skip if summary already exists
    if (lesson.summary) {
      console.log(`Lesson ${lessonId} already has a summary, skipping`);
      return;
    }

    // Generate summary
    console.log(`Generating summary for lesson ${lessonId}: ${lesson.title}`);
    const summary = await generateLessonSummary(
      lesson.rawTranscript,
      lesson.title
    );

    // Update lesson with summary AND mark as COMPLETED
    await prisma.lesson.update({
      where: { id: lessonId },
      data: {
        summary,
        summaryStatus: 'COMPLETED',
      },
    });

    console.log(`Successfully generated summary for lesson ${lessonId}`);
  } catch (error) {
    console.error(`Failed to generate summary for lesson ${lessonId}:`, error);

    // Mark as FAILED so UI can show appropriate message
    await prisma.lesson.update({
      where: { id: lessonId },
      data: { summaryStatus: 'FAILED' },
    }).catch(err => {
      console.error(`Failed to mark lesson ${lessonId} as FAILED:`, err);
    });

    // Don't throw - we don't want to fail the whole lesson creation
  }
}
