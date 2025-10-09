'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface User {
  id: string;
  email: string;
  name: string | null;
  role: 'ADMIN' | 'TEACHER' | 'STUDENT';
  _count: {
    courses: number;
    enrollments: number;
    chatSessions: number;
  };
}

interface DeleteUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
}

export default function DeleteUserModal({ isOpen, onClose, user }: DeleteUserModalProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    if (!user) return;

    setIsDeleting(true);
    setError(null);

    try {
      const response = await fetch(`/api/admin/users/${user.id}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to delete user');
      }

      // Success - close modal and refresh page
      onClose();
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleClose = () => {
    setError(null);
    onClose();
  };

  if (!isOpen || !user) return null;

  const hasRelatedData =
    user._count.courses > 0 ||
    user._count.enrollments > 0 ||
    user._count.chatSessions > 0;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4">
          <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full">
            {/* Header */}
            <div className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-red-100 rounded-full p-3">
                  <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-gray-900">Delete User</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    {user.name || user.email}
                  </p>
                </div>
              </div>

              {/* Warning Message */}
              <div className="mt-4">
                <p className="text-sm text-gray-700">
                  Are you sure you want to delete this user? This action cannot be undone.
                </p>

                {/* User Info */}
                <div className="mt-4 bg-gray-50 rounded-md p-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Email:</span>
                    <span className="font-medium text-gray-900">{user.email}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Role:</span>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                      user.role === 'ADMIN'
                        ? 'bg-purple-100 text-purple-800'
                        : user.role === 'TEACHER'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {user.role}
                    </span>
                  </div>
                </div>

                {/* Related Data Warning */}
                {hasRelatedData && (
                  <div className="mt-4 bg-red-50 border border-red-200 rounded-md p-4">
                    <div className="flex">
                      <svg className="h-5 w-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      <div className="ml-3">
                        <h4 className="text-sm font-medium text-red-800">
                          Warning! This user has related data:
                        </h4>
                        <div className="mt-2 text-sm text-red-700">
                          <ul className="list-disc list-inside mt-1 space-y-1">
                            {user._count.courses > 0 && (
                              <li>{user._count.courses} course{user._count.courses !== 1 ? 's' : ''}</li>
                            )}
                            {user._count.enrollments > 0 && (
                              <li>{user._count.enrollments} enrollment{user._count.enrollments !== 1 ? 's' : ''}</li>
                            )}
                            {user._count.chatSessions > 0 && (
                              <li>{user._count.chatSessions} chat session{user._count.chatSessions !== 1 ? 's' : ''}</li>
                            )}
                          </ul>
                          <p className="mt-2">
                            Back up critical data before deleting user.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Error Message */}
                {error && (
                  <div className="mt-4 bg-red-50 border border-red-200 rounded-md p-4">
                    <div className="flex">
                      <svg className="h-5 w-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <div className="ml-3">
                        <p className="text-sm text-red-800">{error}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Footer Buttons */}
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isDeleting ? 'Deleting...' : 'Delete User'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
