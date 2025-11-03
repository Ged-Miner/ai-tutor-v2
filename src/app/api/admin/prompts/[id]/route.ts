import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { updateSystemPromptSchema } from '@/lib/validations/system-prompt';

/**
 * GET /api/admin/prompts/[id]
 * Get a single system prompt
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 403 }
      );
    }

    const { id } = await params;

    const prompt = await prisma.systemPrompt.findUnique({
      where: { id },
    });

    if (!prompt) {
      return NextResponse.json(
        { error: 'System prompt not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(prompt, { status: 200 });
  } catch (error) {
    console.error('Error fetching system prompt:', error);
    return NextResponse.json(
      { error: 'Failed to fetch system prompt' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/prompts/[id]
 * Update a system prompt (content and isActive only, version increments)
 * If activating a tutor prompt, deactivate all other tutor prompts
 */
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 403 }
      );
    }

    const { id } = await params;
    const body = await request.json();

    const validationResult = updateSystemPromptSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: validationResult.error.format(),
        },
        { status: 400 }
      );
    }

    const { content, isActive } = validationResult.data;

    // Check if prompt exists
    const existingPrompt = await prisma.systemPrompt.findUnique({
      where: { id },
    });

    if (!existingPrompt) {
      return NextResponse.json(
        { error: 'System prompt not found' },
        { status: 404 }
      );
    }

    // If activating a tutor prompt, deactivate all other tutor prompts
    if (isActive && existingPrompt.name.includes('tutor')) {
      await prisma.systemPrompt.updateMany({
        where: {
          name: {
            contains: 'tutor',
          },
          id: {
            not: id, // Don't deactivate the one we're updating
          },
        },
        data: {
          isActive: false,
        },
      });
      console.log('🔄 Deactivated other tutor prompts');
    }

    // Update prompt and increment version
    const updatedPrompt = await prisma.systemPrompt.update({
      where: { id },
      data: {
        content,
        isActive,
        version: {
          increment: 1,
        },
      },
    });

    console.log(`✅ Updated prompt: ${updatedPrompt.name} (v${updatedPrompt.version}, active: ${updatedPrompt.isActive})`);

    return NextResponse.json(updatedPrompt, { status: 200 });
  } catch (error) {
    console.error('Error updating system prompt:', error);
    return NextResponse.json(
      { error: 'Failed to update system prompt' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/prompts/[id]
 * Delete a system prompt
 */
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 403 }
      );
    }

    const { id } = await params;

    // Check if prompt exists
    const existingPrompt = await prisma.systemPrompt.findUnique({
      where: { id },
    });

    if (!existingPrompt) {
      return NextResponse.json(
        { error: 'System prompt not found' },
        { status: 404 }
      );
    }

    // Delete the prompt
    await prisma.systemPrompt.delete({
      where: { id },
    });

    return NextResponse.json(
      { message: 'System prompt deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting system prompt:', error);
    return NextResponse.json(
      { error: 'Failed to delete system prompt' },
      { status: 500 }
    );
  }
}
