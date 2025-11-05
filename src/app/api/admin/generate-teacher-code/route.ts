import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { generateTeacherCode } from '@/lib/utils/generate-teacher-code';
// removed NextRequest import which was used in GET()
/**
 * GET /api/admin/generate-teacher-code
 * Generate a unique teacher code (admin only)
 */
export async function GET() {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      );
    }

    const teacherCode = await generateTeacherCode();

    return NextResponse.json(
      { teacherCode },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error generating teacher code:', error);
    return NextResponse.json(
      { error: 'Failed to generate teacher code' },
      { status: 500 }
    );
  }
}
