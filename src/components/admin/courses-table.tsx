'use client';

import { useState } from 'react';
import Link from 'next/link';
import { EditCourseModal } from './edit-course-modal';
import { DeleteCourseModal } from './delete-course-modal';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card } from '@/components/ui/card';
import { Pencil, Trash2, Eye } from 'lucide-react';

interface Course {
  id: string;
  name: string;
  description: string | null;
  courseCode: string;
  createdAt: Date;
  teacher: {
    id: string;
    name: string | null;
    email: string;
  };
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
      {/* Desktop Table */}
      <Card className="hidden md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Course Name</TableHead>
              <TableHead>Course Code</TableHead>
              <TableHead className="hidden lg:table-cell">Teacher</TableHead>
              <TableHead>Lessons</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {courses.map((course) => (
              <TableRow key={course.id}>
                <TableCell className="font-medium">{course.name}</TableCell>
                <TableCell>
                  <code className="rounded bg-gray-100 px-2 py-1 text-sm font-mono text-gray-900">
                    {course.courseCode}
                  </code>
                </TableCell>
                <TableCell className="hidden lg:table-cell">
                  <div className="flex flex-col">
                    <span className="text-sm">{course.teacher.name || 'No name'}</span>
                    <span className="text-xs text-muted-foreground">
                      {course.teacher.email}
                    </span>
                  </div>
                </TableCell>
                <TableCell>{course._count.lessons}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Link href={`/admin/courses/${course.id}/lessons`}>
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditingCourse(course)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setDeletingCourse(course)}
                    >
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      {/* Mobile Card Layout */}
      <div className="md:hidden space-y-3">
        {courses.map((course) => (
          <Card key={course.id} className="p-4">
            <div className="space-y-3">
              <div>
                <h3 className="font-medium">{course.name}</h3>
                <div className="mt-1">
                  <code className="rounded bg-gray-100 px-2 py-1 text-xs font-mono text-gray-900">
                    {course.courseCode}
                  </code>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  {course.teacher.name || 'No name'}
                </p>
                <p className="text-xs text-muted-foreground">
                  {course.teacher.email}
                </p>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  {course._count.lessons} {course._count.lessons === 1 ? 'lesson' : 'lessons'}
                </span>
                <div className="flex gap-1">
                  <Link href={`/admin/courses/${course.id}/lessons`}>
                    <Button variant="ghost" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setEditingCourse(course)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setDeletingCourse(course)}
                  >
                    <Trash2 className="h-4 w-4 text-red-600" />
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        ))}
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
