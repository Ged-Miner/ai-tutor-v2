import OpenAI from 'openai';
import { prisma } from '@/lib/prisma';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

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

    // Call OpenAI to generate summary
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: systemPromptRecord.content,
        },
        {
          role: 'user',
          content: `Lesson Title: ${lessonTitle}\n\nTranscript:\n${transcript}`,
        },
      ],
      temperature: 0.7,
      max_tokens: 2000, // Summaries can be longer than chat responses
    });

    const summary = completion.choices[0]?.message?.content;

    if (!summary) {
      throw new Error('OpenAI returned empty response');
    }

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
        summaryStatus: 'COMPLETED',  // ADD THIS LINE
      },
    });

    console.log(`Successfully generated summary for lesson ${lessonId}`);
  } catch (error) {
    console.error(`Failed to generate summary for lesson ${lessonId}:`, error);

    // Mark as FAILED so UI can show appropriate message
    await prisma.lesson.update({
      where: { id: lessonId },
      data: { summaryStatus: 'FAILED' },  // ADD THIS BLOCK
    }).catch(err => {
      console.error(`Failed to mark lesson ${lessonId} as FAILED:`, err);
    });

    // Don't throw - we don't want to fail the whole lesson creation
  }
}
