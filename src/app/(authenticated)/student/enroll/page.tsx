import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { EnrollmentForm } from '@/components/student/enrollment-form';

export default async function StudentEnrollPage() {
  const session = await auth();

  if (!session?.user || session.user.role !== 'STUDENT') {
    redirect('/auth/signin');
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6 py-12">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900">
          Enroll in a Course
        </h1>
        <p className="mt-2 text-gray-600">
          Enter your teacher&apos;s code to access their courses
        </p>
      </div>

      {/* Info Card */}
      <div className="rounded-lg border bg-blue-50 p-6">
        <h2 className="text-lg font-semibold text-blue-900">
          How to Enroll:
        </h2>
        <ol className="mt-3 space-y-2 text-sm text-blue-800">
          <li>1. Get a teacher code from your instructor (format: TEACH###)</li>
          <li>2. Enter the code below</li>
          <li>3. You&apos;ll be enrolled in all of that teacher&apos;s courses</li>
          <li>4. Start learning!</li>
        </ol>
      </div>

      {/* Enrollment Form */}
      <EnrollmentForm />

      {/* Help Text */}
      <div className="rounded-lg border bg-gray-50 p-4 text-center">
        <p className="text-sm text-gray-600">
          Don&apos;t have a teacher code?{' '}
          <span className="font-medium">Ask your instructor</span> for their
          unique code.
        </p>
      </div>
    </div>
  );
}
