'use client';

import { useState } from 'react';
import { EditLessonModal } from './edit-lesson-modal';
import { DeleteLessonModal } from './delete-lesson-modal';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';

interface Lesson {
  id: string;
  title: string;
  lessonCode: string;
  position: number;
  rawTranscript: string;
  summary: string | null;
  customPrompt: string | null;
  createdAt: Date;
  _count: {
    chatSessions: number;
  };
}

interface LessonsTableProps {
  lessons: Lesson[];
  courseId: string;
}

export function LessonsTable({ lessons, courseId }: LessonsTableProps) {
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
  const [deletingLesson, setDeletingLesson] = useState<Lesson | null>(null);

  return (
    <>
      <div className="rounded-lg border bg-white shadow">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16">Order</TableHead>
              <TableHead>Lesson Title</TableHead>
              <TableHead>Lesson Code</TableHead>
              <TableHead>Chat Sessions</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {lessons.map((lesson) => (
              <TableRow key={lesson.id}>
                <TableCell className="font-medium">
                  {lesson.position + 1}
                </TableCell>
                <TableCell className="font-medium">{lesson.title}</TableCell>
                <TableCell>
                  <code className="rounded bg-gray-100 px-2 py-1 text-xs">
                    {lesson.lessonCode}
                  </code>
                </TableCell>
                <TableCell>{lesson._count.chatSessions}</TableCell>
                <TableCell>
                  {new Date(lesson.createdAt).toLocaleDateString()}
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setEditingLesson(lesson)}
                    className="mr-2"
                  >
                    Edit
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setDeletingLesson(lesson)}
                    className="text-red-600 hover:text-red-900"
                  >
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Modals */}
      {editingLesson && (
        <EditLessonModal
          lesson={editingLesson}
          courseId={courseId}
          onClose={() => setEditingLesson(null)}
        />
      )}

      {deletingLesson && (
        <DeleteLessonModal
          lesson={deletingLesson}
          courseId={courseId}
          onClose={() => setDeletingLesson(null)}
        />
      )}
    </>
  );
}
