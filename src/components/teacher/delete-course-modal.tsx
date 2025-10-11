'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface DeleteCourseModalProps {
  course: {
    id: string;
    name: string;
    _count: {
      lessons: number;
      enrollments: number;
    };
  };
  onClose: () => void;
}

export function DeleteCourseModal({ course, onClose }: DeleteCourseModalProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmName, setConfirmName] = useState('');
  const [error, setError] = useState('');

  const hasRelatedData =
    course._count.lessons > 0 || course._count.enrollments > 0;

  const handleDelete = async () => {
    if (confirmName !== course.name) {
      setError('Course name does not match. Please type the exact course name.');
      return;
    }

    setIsDeleting(true);
    setError('');

    try {
      const response = await fetch(`/api/teacher/courses/${course.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete course');
      }

      router.refresh();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete course');
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
        <h2 className="mb-4 text-xl font-bold text-red-600">
          ⚠️ Delete Course - This Cannot Be Undone
        </h2>

        <div className="mb-4 space-y-2">
          <p className="text-sm text-gray-700">
            You are about to <strong>permanently delete</strong> this course:
          </p>
          <div className="rounded-md bg-gray-50 p-3">
            <p className="font-semibold">{course.name}</p>
          </div>

          {hasRelatedData && (
            <div className="rounded-md border-2 border-red-300 bg-red-50 p-4">
              <p className="mb-2 font-bold text-red-800">
                🔥 This will also permanently delete:
              </p>
              <ul className="space-y-1 text-sm text-red-700">
                {course._count.lessons > 0 && (
                  <li>
                    • <strong>{course._count.lessons}</strong> lesson(s) and
                    all their content
                  </li>
                )}
                {course._count.enrollments > 0 && (
                  <li>
                    • <strong>{course._count.enrollments}</strong> student
                    enrollment(s)
                  </li>
                )}
              </ul>
              <p className="mt-2 text-xs font-semibold text-red-900">
                All chat sessions for this course will be lost!
              </p>
            </div>
          )}
        </div>

        <div className="mb-4">
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Type{' '}
            <code className="rounded bg-gray-100 px-1">{course.name}</code> to
            confirm:
          </label>
          <input
            type="text"
            value={confirmName}
            onChange={(e) => {
              setConfirmName(e.target.value);
              setError('');
            }}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
            placeholder="Type course name to confirm"
          />
        </div>

        {error && <p className="mb-4 text-sm text-red-600">{error}</p>}

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            disabled={isDeleting}
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={isDeleting || confirmName !== course.name}
            className="flex-1 rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-gray-300"
          >
            {isDeleting ? 'Deleting...' : 'Permanently Delete'}
          </button>
        </div>
      </div>
    </div>
  );
}
