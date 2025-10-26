import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import CreateUserButton from '@/components/admin/create-user-button';
import UsersTable from '@/components/admin/users-table';

export default async function AdminUsersPage() {
  // Check authentication and authorization
  const session = await auth();

  if (!session?.user) {
    redirect('/auth/signin');
  }

  if (session.user.role !== 'ADMIN') {
    redirect('/dashboard');
  }

  // Fetch all users
  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      teacherCode: true,
      createdAt: true,
      _count: {
        select: {
          courses: true,
          enrollments: true,
          chatSessions: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  return (
    <div className="space-y-6">
      {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
            <p className="mt-2 text-sm text-gray-600">
              Manage all users, roles, and permissions
            </p>
          </div>
        </div>

        {/* Breadcrumb */}
        <nav className="mt-4 flex" aria-label="Breadcrumb">
          <ol className="flex items-center space-x-2 text-sm text-gray-500">
            <li>
              <Link href="/dashboard" className="hover:text-gray-700">Dashboard</Link>
            </li>
            <li>
              <span className="mx-2">/</span>
            </li>
            <li className="text-gray-900 font-medium">Users</li>
          </ol>
        </nav>

      {/* Users Table */}
      <UsersTable users={users} />
      <CreateUserButton />
    </div>
  );
}
