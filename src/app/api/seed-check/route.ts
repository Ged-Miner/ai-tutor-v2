import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Get counts
    const userCount = await prisma.user.count();
    const courseCount = await prisma.course.count();
    const lessonCount = await prisma.lesson.count();
    const enrollmentCount = await prisma.enrollment.count();

    // Get sample data
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        teacherCode: true,
      },
    });

    const courses = await prisma.course.findMany({
      select: {
        id: true,
        name: true,
        description: true,
        teacher: {
          select: {
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
    });

    const lessons = await prisma.lesson.findMany({
      select: {
        id: true,
        title: true,
        lessonCode: true,
        position: true,
        course: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        position: 'asc',
      },
    });

    return NextResponse.json({
      success: true,
      summary: {
        users: userCount,
        courses: courseCount,
        lessons: lessonCount,
        enrollments: enrollmentCount,
      },
      data: {
        users,
        courses,
        lessons,
      },
    });
  } catch (error) {
    console.error('Database query error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch data',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
