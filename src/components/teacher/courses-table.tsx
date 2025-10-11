'use client';

import { useState } from 'react';
import { EditCourseModal } from './edit-course-modal';
import { DeleteCourseModal } from './delete-course-modal';

interface Course {
  id: string;
  name: string;
  description: string | null;
  createdAt: Date;
  _count: {
    lessons: number;
    enrollments: number;
  };
}

interface CoursesTableProps {
  courses: Course[];
}

export function CoursesTable({ courses }: CoursesTableProps) {
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [deletingCourse, setDeletingCourse] = useState<Course | null>(null);

  return (
    <>
      <div className="overflow-hidden rounded-lg bg-white shadow">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Course Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Description
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Lessons
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Students
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Created
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {courses.map((course) => (
              <tr key={course.id} className="hover:bg-gray-50">
                <td className="whitespace-nowrap px-6 py-4">
                  <div className="text-sm font-medium text-gray-900">
                    {course.name}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-500 line-clamp-2">
                    {course.description || (
                      <span className="italic text-gray-400">No description</span>
                    )}
                  </div>
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                  {course._count.lessons}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                  {course._count.enrollments}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                  {new Date(course.createdAt).toLocaleDateString()}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                  <button
                    onClick={() => setEditingCourse(course)}
                    className="mr-4 text-blue-600 hover:text-blue-900"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => setDeletingCourse(course)}
                    className="text-red-600 hover:text-red-900"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modals */}
      {editingCourse && (
        <EditCourseModal
          course={editingCourse}
          onClose={() => setEditingCourse(null)}
        />
      )}

      {deletingCourse && (
        <DeleteCourseModal
          course={deletingCourse}
          onClose={() => setDeletingCourse(null)}
        />
      )}
    </>
  );
}
