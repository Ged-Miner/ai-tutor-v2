'use client';

import Link from 'next/link';

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Sign Up
          </h1>
          <p className="text-gray-600 mb-8">
            Sign up functionality coming soon!
          </p>

          <div className="p-4 bg-blue-50 rounded-lg mb-6">
            <p className="text-sm text-blue-900">
              For now, please use one of the demo accounts to test the application.
            </p>
          </div>

          <Link
            href="/auth/signin"
            className="block w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition"
          >
            Go to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
