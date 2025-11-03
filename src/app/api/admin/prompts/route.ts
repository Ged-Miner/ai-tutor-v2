import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { createSystemPromptSchema } from '@/lib/validations/system-prompt';

/**
 * GET /api/admin/prompts
 * List all system prompts
 */
export async function GET() {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 403 }
      );
    }

    const prompts = await prisma.systemPrompt.findMany({
      orderBy: [
        { isActive: 'desc' }, // Active prompts first
        { createdAt: 'desc' },
      ],
    });

    return NextResponse.json(prompts, { status: 200 });
  } catch (error) {
    console.error('Error fetching system prompts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch system prompts' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/prompts
 * Create a new system prompt
 */
export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validationResult = createSystemPromptSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: validationResult.error.format(),
        },
        { status: 400 }
      );
    }

    const { name, content, isActive } = validationResult.data;

    // Check if prompt with this name already exists
    const existingPrompt = await prisma.systemPrompt.findUnique({
      where: { name },
    });

    if (existingPrompt) {
      return NextResponse.json(
        { error: 'A prompt with this name already exists' },
        { status: 409 }
      );
    }

    // Create new prompt
    const newPrompt = await prisma.systemPrompt.create({
      data: {
        name,
        content,
        isActive,
        version: 1,
      },
    });

    return NextResponse.json(newPrompt, { status: 201 });
  } catch (error) {
    console.error('Error creating system prompt:', error);
    return NextResponse.json(
      { error: 'Failed to create system prompt' },
      { status: 500 }
    );
  }
}
