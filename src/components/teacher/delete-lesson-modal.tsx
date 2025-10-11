'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface DeleteLessonModalProps {
  lesson: {
    id: string;
    title: string;
    _count: {
      chatSessions: number;
    };
  };
  courseId: string;
  onClose: () => void;
}

export function DeleteLessonModal({
  lesson,
  courseId,
  onClose,
}: DeleteLessonModalProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmTitle, setConfirmTitle] = useState('');
  const [error, setError] = useState('');

  const hasRelatedData = lesson._count.chatSessions > 0;

  const handleDelete = async () => {
    if (confirmTitle !== lesson.title) {
      setError(
        'Lesson title does not match. Please type the exact lesson title.'
      );
      return;
    }

    setIsDeleting(true);
    setError('');

    try {
      const response = await fetch(
        `/api/teacher/courses/${courseId}/lessons/${lesson.id}`,
        {
          method: 'DELETE',
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete lesson');
      }

      router.refresh();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete lesson');
      setIsDeleting(false);
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-red-600">
            ⚠️ Delete Lesson - This Cannot Be Undone
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <p className="text-sm text-gray-700">
            You are about to <strong>permanently delete</strong> this lesson:
          </p>

          <div className="rounded-md bg-gray-50 p-3">
            <p className="font-semibold">{lesson.title}</p>
          </div>

          {hasRelatedData && (
            <Alert variant="destructive">
              <AlertDescription>
                <p className="mb-2 font-bold">
                  🔥 This will also permanently delete:
                </p>
                <ul className="space-y-1 text-sm">
                  <li>
                    • <strong>{lesson._count.chatSessions}</strong> chat
                    session(s)
                  </li>
                </ul>
                <p className="mt-2 text-xs font-semibold">
                  All student conversations for this lesson will be lost!
                </p>
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="confirmTitle">
              Type <code className="rounded bg-gray-100 px-1">{lesson.title}</code>{' '}
              to confirm:
            </Label>
            <Input
              id="confirmTitle"
              value={confirmTitle}
              onChange={(e) => {
                setConfirmTitle(e.target.value);
                setError('');
              }}
              placeholder="Type lesson title to confirm"
            />
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isDeleting}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting || confirmTitle !== lesson.title}
              className="flex-1"
            >
              {isDeleting ? 'Deleting...' : 'Permanently Delete'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
