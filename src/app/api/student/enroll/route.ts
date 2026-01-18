import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { enrollmentSchema } from '@/lib/validations/enrollment';

/**
 * POST /api/student/enroll
 * Enroll a student in a single course via course code
 */
export async function POST(request: Request) {
  try {
    const session = await auth();

    // Check authentication and role
    if (!session?.user || session.user.role !== 'STUDENT') {
      return NextResponse.json(
        { error: 'Unauthorized - Student access required' },
        { status: 401 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validationResult = enrollmentSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: validationResult.error.format(),
        },
        { status: 400 }
      );
    }

    const { courseCode } = validationResult.data;

    // Find course by code
    const course = await prisma.course.findUnique({
      where: { courseCode },
      include: {
        teacher: {
          select: { name: true },
        },
        _count: {
          select: { lessons: true },
        },
      },
    });

    if (!course) {
      return NextResponse.json(
        { error: 'Invalid course code. Please check and try again.' },
        { status: 404 }
      );
    }

    // Check if already enrolled
    const existingEnrollment = await prisma.enrollment.findUnique({
      where: {
        studentId_courseId: {
          studentId: session.user.id,
          courseId: course.id,
        },
      },
    });

    if (existingEnrollment) {
      return NextResponse.json(
        {
          success: true,
          alreadyEnrolled: true,
          message: 'You are already enrolled in this course.',
          course: {
            id: course.id,
            name: course.name,
          },
        },
        { status: 200 }
      );
    }

    // Create enrollment
    await prisma.enrollment.create({
      data: {
        studentId: session.user.id,
        courseId: course.id,
      },
    });

    return NextResponse.json({
      success: true,
      message: `Successfully enrolled in ${course.name}!`,
      course: {
        id: course.id,
        name: course.name,
        teacher: course.teacher.name,
        lessonCount: course._count.lessons,
      },
    }, { status: 201 });

  } catch (error) {
    console.error('Error enrolling student:', error);
    return NextResponse.json(
      { error: 'Failed to enroll. Please try again.' },
      { status: 500 }
    );
  }
}
