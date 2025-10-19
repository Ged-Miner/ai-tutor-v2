'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, AlertTriangle } from 'lucide-react';

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
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10">
              <AlertTriangle className="h-5 w-5 text-destructive" />
            </div>
            <div>
              <DialogTitle className="text-destructive">
                Delete Course - This Cannot Be Undone
              </DialogTitle>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            You are about to <strong>permanently delete</strong> this course:
          </p>

          <div className="rounded-lg border bg-muted/50 p-3">
            <p className="font-semibold">{course.name}</p>
          </div>

          {hasRelatedData && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <div className="font-medium mb-2">
                  This will also permanently delete:
                </div>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  {course._count.lessons > 0 && (
                    <li>
                      <strong>{course._count.lessons}</strong> lesson(s) and all their content
                    </li>
                  )}
                  {course._count.enrollments > 0 && (
                    <li>
                      <strong>{course._count.enrollments}</strong> student enrollment(s)
                    </li>
                  )}
                </ul>
                <p className="mt-2 text-xs font-semibold">
                  All chat sessions for this course will be lost!
                </p>
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="confirm-name">
              Type <code className="rounded bg-muted px-1 text-sm">{course.name}</code> to confirm:
            </Label>
            <Input
              id="confirm-name"
              type="text"
              value={confirmName}
              onChange={(e) => {
                setConfirmName(e.target.value);
                setError('');
              }}
              placeholder="Type course name to confirm"
              className={error ? 'border-destructive' : ''}
            />
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isDeleting}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting || confirmName !== course.name}
          >
            {isDeleting ? 'Deleting...' : 'Permanently Delete'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
