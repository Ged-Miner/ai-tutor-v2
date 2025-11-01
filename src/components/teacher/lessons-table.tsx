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
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Pencil, Trash2 } from 'lucide-react';
import { CreateLessonButton } from './create-lesson-button';

interface Lesson {
  id: string;
  title: string;
  lessonCode: string;
  position: number;
  rawTranscript: string;
  summary: string | null;
  summaryStatus: string;
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

function SummaryStatusBadge({
  summaryStatus
}: {
  summaryStatus: string
}) {
  if (summaryStatus === 'COMPLETED') {
    return (
      <span className="inline-flex items-center gap-1 text-xs text-green-600">
        <span className="w-2 h-2 rounded-full bg-green-600" />
        Ready
      </span>
    );
  }

  if (summaryStatus === 'GENERATING') {
    return (
      <span className="inline-flex items-center gap-1 text-xs text-yellow-600">
        <span className="w-2 h-2 rounded-full bg-yellow-600 animate-pulse" />
        Generating
      </span>
    );
  }

  if (summaryStatus === 'FAILED') {
    return (
      <span className="inline-flex items-center gap-1 text-xs text-red-600">
        <span className="w-2 h-2 rounded-full bg-red-600" />
        Failed
      </span>
    );
  }

  // NOT_STARTED
  return (
    <span className="inline-flex items-center gap-1 text-xs text-gray-500">
      <span className="w-2 h-2 rounded-full bg-gray-400" />
      Not Started
    </span>
  );
}

export function LessonsTable({ lessons, courseId }: LessonsTableProps) {
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
  const [deletingLesson, setDeletingLesson] = useState<Lesson | null>(null);

  return (
    <>
      {/* Desktop Table */}
      <Card className="hidden md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16">Order</TableHead>
              <TableHead>Lesson Title</TableHead>
              <TableHead className="hidden sm:table-cell">Lesson Code</TableHead>
              <TableHead className="hidden lg:table-cell">Summary</TableHead>
              <TableHead className="hidden sm:table-cell">Chat Sessions</TableHead>
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
                <TableCell className="hidden sm:table-cell">
                  <code className="rounded bg-muted px-2 py-1 text-xs">
                    {lesson.lessonCode}
                  </code>
                </TableCell>
                <TableCell className="hidden lg:table-cell"> {/* ADD THIS */}
                  <SummaryStatusBadge summaryStatus={lesson.summaryStatus} />
                </TableCell>
                <TableCell className="hidden sm:table-cell">{lesson._count.chatSessions}</TableCell>
                {/* <TableCell className="hidden xl:table-cell">
                  {new Date(lesson.createdAt).toLocaleDateString()}
                </TableCell> */}
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditingLesson(lesson)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setDeletingLesson(lesson)}
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
        {lessons.map((lesson) => (
          <Card key={lesson.id} className="p-4">
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-medium">
                      {lesson.position + 1}
                    </span>
                    <h3 className="font-medium truncate">{lesson.title}</h3>
                  </div>
                  <div className="flex flex-col gap-1 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <span>Code:</span>
                      <code className="rounded bg-muted px-2 py-0.5 text-xs">
                        {lesson.lessonCode}
                      </code>
                    </div>
                    <div className="flex items-center gap-2"> {/* ADD THIS */}
                      <span>Summary:</span>
                      <SummaryStatusBadge summaryStatus={lesson.summaryStatus} />
                    </div>
                    <div className="flex gap-3">
                      <span>{lesson._count.chatSessions} {lesson._count.chatSessions === 1 ? 'session' : 'sessions'}</span>
                      <span>{new Date(lesson.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setEditingLesson(lesson)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setDeletingLesson(lesson)}
                  >
                    <Trash2 className="h-4 w-4 text-red-600" />
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <CreateLessonButton courseId={courseId} />

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
