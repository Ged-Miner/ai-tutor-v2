import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/student/courses
 * Fetch all courses the logged-in student is enrolled in
 */
export async function GET() {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== 'STUDENT') {
      return NextResponse.json(
        { error: 'Unauthorized - Student access required' },
        { status: 401 }
      );
    }

    // Fetch enrollments with course details
    const enrollments = await prisma.enrollment.findMany({
      where: {
        studentId: session.user.id,
      },
      include: {
        course: {
          include: {
            teacher: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
            _count: {
              select: {
                lessons: true,
                enrollments: true,
              },
            },
          },
        },
      },
      orderBy: {
        enrolledAt: 'desc', // Most recently enrolled first
      },
    });

    // Extract courses from enrollments
    const courses = enrollments.map(enrollment => ({
      ...enrollment.course,
      enrolledAt: enrollment.enrolledAt,
    }));

    return NextResponse.json(courses);
  } catch (error) {
    console.error('Error fetching student courses:', error);
    return NextResponse.json(
      { error: 'Failed to fetch courses' },
      { status: 500 }
    );
  }
}
