import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { updateAISettingsSchema } from '@/lib/validations/ai-settings';

// Default settings for new installations
const DEFAULT_SETTINGS = {
  model: 'gpt-5-nano',
  reasoning: 'minimal',
  verbosity: 'medium',
  streaming: false,
  maxMessagesPerChat: null as number | null,
};

// GET /api/admin/settings/ai - Get current AI settings
export async function GET() {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch both settings
    const [transcriptSettings, chatbotSettings] = await Promise.all([
      prisma.aISettings.findUnique({ where: { type: 'TRANSCRIPT' } }),
      prisma.aISettings.findUnique({ where: { type: 'CHATBOT' } }),
    ]);

    // Return settings with defaults if not yet created
    return NextResponse.json({
      transcript: {
        model: transcriptSettings?.model ?? DEFAULT_SETTINGS.model,
        reasoning: transcriptSettings?.reasoning ?? DEFAULT_SETTINGS.reasoning,
        verbosity: transcriptSettings?.verbosity ?? DEFAULT_SETTINGS.verbosity,
      },
      chatbot: {
        model: chatbotSettings?.model ?? DEFAULT_SETTINGS.model,
        reasoning: chatbotSettings?.reasoning ?? DEFAULT_SETTINGS.reasoning,
        verbosity: chatbotSettings?.verbosity ?? DEFAULT_SETTINGS.verbosity,
        streaming: chatbotSettings?.streaming ?? DEFAULT_SETTINGS.streaming,
        maxMessagesPerChat: chatbotSettings?.maxMessagesPerChat ?? DEFAULT_SETTINGS.maxMessagesPerChat,
      },
    });
  } catch (error) {
    console.error('Error fetching AI settings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch AI settings' },
      { status: 500 }
    );
  }
}

// PUT /api/admin/settings/ai - Update AI settings
export async function PUT(request: Request) {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validationResult = updateAISettingsSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validationResult.error.errors },
        { status: 400 }
      );
    }

    const { transcript, chatbot } = validationResult.data;

    // Upsert both settings
    const [transcriptSettings, chatbotSettings] = await Promise.all([
      prisma.aISettings.upsert({
        where: { type: 'TRANSCRIPT' },
        update: {
          model: transcript.model,
          reasoning: transcript.reasoning,
          verbosity: transcript.verbosity,
        },
        create: {
          type: 'TRANSCRIPT',
          model: transcript.model,
          reasoning: transcript.reasoning,
          verbosity: transcript.verbosity,
        },
      }),
      prisma.aISettings.upsert({
        where: { type: 'CHATBOT' },
        update: {
          model: chatbot.model,
          reasoning: chatbot.reasoning,
          verbosity: chatbot.verbosity,
          streaming: chatbot.streaming,
          maxMessagesPerChat: chatbot.maxMessagesPerChat,
        },
        create: {
          type: 'CHATBOT',
          model: chatbot.model,
          reasoning: chatbot.reasoning,
          verbosity: chatbot.verbosity,
          streaming: chatbot.streaming,
          maxMessagesPerChat: chatbot.maxMessagesPerChat,
        },
      }),
    ]);

    console.log('AI settings updated:', { transcriptSettings, chatbotSettings });

    return NextResponse.json({
      transcript: {
        model: transcriptSettings.model,
        reasoning: transcriptSettings.reasoning,
        verbosity: transcriptSettings.verbosity,
      },
      chatbot: {
        model: chatbotSettings.model,
        reasoning: chatbotSettings.reasoning,
        verbosity: chatbotSettings.verbosity,
        streaming: chatbotSettings.streaming,
        maxMessagesPerChat: chatbotSettings.maxMessagesPerChat,
      },
    });
  } catch (error) {
    console.error('Error updating AI settings:', error);
    return NextResponse.json(
      { error: 'Failed to update AI settings' },
      { status: 500 }
    );
  }
}
