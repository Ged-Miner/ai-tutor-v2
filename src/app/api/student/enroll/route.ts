import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { enrollmentSchema } from '@/lib/validations/enrollment';

/**
 * POST /api/student/enroll
 * Enroll a student in all courses taught by a teacher (via teacher code)
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

    const { teacherCode } = validationResult.data;

    // Find teacher by code
    const teacher = await prisma.user.findUnique({
      where: {
        teacherCode,
        role: 'TEACHER',
      },
      include: {
        courses: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!teacher) {
      return NextResponse.json(
        { error: 'Invalid teacher code. Please check and try again.' },
        { status: 404 }
      );
    }

    if (teacher.courses.length === 0) {
      return NextResponse.json(
        { error: 'This teacher has no courses available yet.' },
        { status: 404 }
      );
    }

    // Check if already enrolled in any courses
    const existingEnrollments = await prisma.enrollment.findMany({
      where: {
        studentId: session.user.id,
        courseId: {
          in: teacher.courses.map(c => c.id),
        },
      },
    });

    const existingCourseIds = new Set(
      existingEnrollments.map(e => e.courseId)
    );

    // Filter out courses already enrolled in
    const coursesToEnroll = teacher.courses.filter(
      course => !existingCourseIds.has(course.id)
    );

    if (coursesToEnroll.length === 0) {
      return NextResponse.json(
        {
          success: true,
          enrolled: 0,
          courses: [],
          message: 'You are already enrolled in all courses from this teacher.',
          alreadyEnrolled: true,
        },
        { status: 200 }
      );
    }

    // Create enrollments for all new courses
    await prisma.enrollment.createMany({
      data: coursesToEnroll.map(course => ({
        studentId: session.user.id,
        courseId: course.id,
      })),
    });

    return NextResponse.json({
      success: true,
      enrolled: coursesToEnroll.length,
      courses: coursesToEnroll,
      message: `Successfully enrolled in ${coursesToEnroll.length} course(s)!`,
    }, { status: 201 });

  } catch (error) {
    console.error('Error enrolling student:', error);
    return NextResponse.json(
      { error: 'Failed to enroll. Please try again.' },
      { status: 500 }
    );
  }
}
