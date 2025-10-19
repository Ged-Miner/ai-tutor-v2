import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { DashboardData, CourseWithCounts, EnrollmentWithCourse } from "@/types/dashboard";
import Link from 'next/link';

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user) {
    return null;
  }

  // Fetch user-specific data based on role
  const dashboardData: DashboardData = {};

  if (session.user.role === "TEACHER") {
    const courses = await prisma.course.findMany({
      where: { teacherId: session.user.id },
      include: {
        _count: {
          select: {
            lessons: true,
            enrollments: true,
          },
        },
      },
    });
    dashboardData.courses = courses;
  }

  if (session.user.role === "STUDENT") {
    const enrollments = await prisma.enrollment.findMany({
      where: { studentId: session.user.id },
      include: {
        course: {
          include: {
            teacher: {
              select: { name: true },
            },
            _count: {
              select: { lessons: true },
            },
          },
        },
      },
    });
    dashboardData.enrollments = enrollments;
  }

  if (session.user.role === "ADMIN") {
    const stats = await prisma.$transaction([
      prisma.user.count(),
      prisma.course.count(),
      prisma.lesson.count(),
      prisma.chatSession.count(),
    ]);
    dashboardData.stats = {
      users: stats[0],
      courses: stats[1],
      lessons: stats[2],
      chatSessions: stats[3],
    };
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {session.user.name}!
        </h1>
        <p className="text-gray-600 mt-1">
          Role: <span className="font-medium">{session.user.role}</span>
        </p>
      </div>

      {/* Admin Dashboard */}
      {session.user.role === "ADMIN" && dashboardData.stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm text-gray-600">Total Users</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">
              {dashboardData.stats.users}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm text-gray-600">Total Courses</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">
              {dashboardData.stats.courses}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm text-gray-600">Total Lessons</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">
              {dashboardData.stats.lessons}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm text-gray-600">Chat Sessions</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">
              {dashboardData.stats.chatSessions}
            </p>
          </div>
        </div>
      )}

      {/* Teacher Dashboard */}
      {session.user.role === "TEACHER" && (
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Your Courses
          </h2>
          {dashboardData.courses && dashboardData.courses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {dashboardData.courses.map((course: CourseWithCounts) => (
                <Link
                  key={course.id}
                  href={`/teacher/courses/${course.id}/lessons`}
                  className="bg-white rounded-lg shadow p-6 hover:shadow-md transition block"
                >
                  <h3 className="font-semibold text-gray-900 mb-2">
                    {course.name}
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    {course.description}
                  </p>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">
                      {course._count.lessons} lessons
                    </span>
                    <span className="text-gray-500">
                      {course._count.enrollments} students
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <p className="text-gray-600">You haven&apos;t created any courses yet.</p>
            </div>
          )}
        </div>
      )}

      {/* Student Dashboard */}
      {session.user.role === "STUDENT" && (
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Your Enrolled Courses
          </h2>
          {dashboardData.enrollments && dashboardData.enrollments.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {dashboardData.enrollments.map((enrollment: EnrollmentWithCourse) => (
                <Link
                  key={enrollment.id}
                  href={`/student/courses/${enrollment.course.id}/lessons`}
                  className="bg-white rounded-lg shadow p-6 hover:shadow-md transition block"
                >
                  <h3 className="font-semibold text-gray-900 mb-2">
                    {enrollment.course.name}
                  </h3>
                  <p className="text-sm text-gray-600 mb-2">
                    {enrollment.course.description}
                  </p>
                  <p className="text-xs text-gray-500 mb-4">
                    Teacher: {enrollment.course.teacher.name}
                  </p>
                  <div className="text-sm text-gray-500">
                    {enrollment.course._count.lessons} lessons available
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <p className="text-gray-600">
                You&apos;re not enrolled in any courses yet.
              </p>
            </div>
          )}
        </div>
      )}

    </div>
  );
}
