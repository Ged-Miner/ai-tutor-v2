import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Validation schema
const createMessageSchema = z.object({
  chatSessionId: z.string().cuid(),
  content: z.string().min(1).max(5000),
  role: z.enum(['USER', 'ASSISTANT']),
});

/**
 * POST /api/chat/messages
 * Save a new message to the database
 */
export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validation = createMessageSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request data', details: validation.error.errors },
        { status: 400 }
      );
    }

    const { chatSessionId, content, role } = validation.data;

    // Verify the chat session belongs to this student
    const chatSession = await prisma.chatSession.findUnique({
      where: { id: chatSessionId },
      select: { studentId: true, lessonId: true },
    });

    if (!chatSession) {
      return NextResponse.json(
        { error: 'Chat session not found' },
        { status: 404 }
      );
    }

    if (chatSession.studentId !== session.user.id && session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Forbidden - You can only save messages to your own chat sessions' },
        { status: 403 }
      );
    }

    // Create the message
    const message = await prisma.message.create({
      data: {
        chatSessionId,
        content,
        role,
      },
    });

    return NextResponse.json(message);
  } catch (error) {
    console.error('Error saving message:', error);
    return NextResponse.json(
      { error: 'Failed to save message' },
      { status: 500 }
    );
  }
}
