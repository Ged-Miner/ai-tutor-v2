'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, AlertTriangle } from 'lucide-react';

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

  if (!user) return null;

  const hasRelatedData =
    user._count.courses > 0 ||
    user._count.enrollments > 0 ||
    user._count.chatSessions > 0;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10">
              <AlertTriangle className="h-5 w-5 text-destructive" />
            </div>
            <div>
              <DialogTitle>Delete User</DialogTitle>
              <DialogDescription>{user.name || user.email}</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Are you sure you want to delete this user? This action cannot be undone.
          </p>

          {/* User Info */}
          <div className="rounded-lg border bg-muted/50 p-4 space-y-2">
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Email:</span>
              <span className="font-medium">{user.email}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Role:</span>
              <Badge
                variant={
                  user.role === 'ADMIN'
                    ? 'default'
                    : user.role === 'TEACHER'
                    ? 'secondary'
                    : 'outline'
                }
              >
                {user.role}
              </Badge>
            </div>
          </div>

          {/* Related Data Warning */}
          {hasRelatedData && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <div className="font-medium mb-2">Warning! This user has related data:</div>
                <ul className="list-disc list-inside space-y-1 text-sm">
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
                <p className="mt-2 text-sm">Back up critical data before deleting user.</p>
              </AlertDescription>
            </Alert>
          )}

          {/* Error Message */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? 'Deleting...' : 'Delete User'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
