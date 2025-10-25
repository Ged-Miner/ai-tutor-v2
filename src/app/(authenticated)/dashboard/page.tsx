import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from 'next/navigation';

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user) {
    return null;
  }

  // Redirect teachers and students to their courses pages
  // Only admins have a unique dashboard with stats
  if (session.user.role === "TEACHER") {
    redirect("/teacher/courses");
  }

  if (session.user.role === "STUDENT") {
    redirect("/student/courses");
  }

  // Only admins reach this point - fetch admin stats
  const stats = await prisma.$transaction([
    prisma.user.count(),
    prisma.course.count(),
    prisma.lesson.count(),
    prisma.chatSession.count(),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Admin Dashboard
        </h1>
        <p className="text-gray-600 mt-1">
          System statistics and overview
        </p>
      </div>

      {/* Admin Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-600">Total Users</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">
            {stats[0]}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-600">Total Courses</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">
            {stats[1]}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-600">Total Lessons</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">
            {stats[2]}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-600">Chat Sessions</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">
            {stats[3]}
          </p>
        </div>
      </div>
    </div>
  );
}
