'use client';

import { useState } from 'react';
import Link from 'next/link'; // ADD THIS
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
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Course Name</TableHead>
              {/* <TableHead>Description</TableHead> */}
              <TableHead>Lessons</TableHead>
              <TableHead>Students</TableHead>
              {/* <TableHead>Created</TableHead> */}
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {courses.map((course) => (
              <TableRow key={course.id}>
                <TableCell className="font-medium">{course.name}</TableCell>
                {/* <TableCell className="max-w-md">
                  <div className="line-clamp-2">
                    {course.description || (
                      <span className="italic text-muted-foreground">
                        No description
                      </span>
                    )}
                  </div>
                </TableCell> */}
                <TableCell>{course._count.lessons}</TableCell>
                <TableCell>{course._count.enrollments}</TableCell>
                {/* <TableCell>
                  {new Date(course.createdAt).toLocaleDateString()}
                </TableCell> */}
                <TableCell className="text-right">
                  <Link href={`/teacher/courses/${course.id}/lessons`}>
                    <Button variant="ghost" size="sm" className="mr-2">
                      View Lessons
                    </Button>
                  </Link>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setEditingCourse(course)}
                    className="mr-2"
                  >
                    Edit
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setDeletingCourse(course)}
                    className="text-red-600 hover:text-red-700"
                  >
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

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
