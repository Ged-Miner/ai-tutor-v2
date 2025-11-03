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
import { AlertCircle, AlertTriangle } from 'lucide-react';

interface SystemPrompt {
  id: string;
  name: string;
  content: string;
  version: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface DeletePromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  prompt: SystemPrompt | null;
}

export default function DeletePromptModal({ isOpen, onClose, prompt }: DeletePromptModalProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    if (!prompt) return;

    setIsDeleting(true);
    setError(null);

    try {
      const response = await fetch(`/api/admin/prompts/${prompt.id}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to delete prompt');
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

  if (!prompt) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Delete System Prompt</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this system prompt? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Error Alert */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Warning if active */}
          {prompt.isActive && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>Warning:</strong> This prompt is currently active and may be in use by the AI system.
              </AlertDescription>
            </Alert>
          )}

          {/* Prompt Details */}
          <div className="rounded-lg bg-muted p-4 space-y-2">
            <div className="text-sm font-medium">{prompt.name}</div>
            <div className="text-sm text-muted-foreground">Version {prompt.version}</div>
            <div className="text-xs text-muted-foreground">
              Created: {new Date(prompt.createdAt).toLocaleDateString()}
            </div>
          </div>

          <p className="text-sm text-muted-foreground">
            This will permanently delete the system prompt and all its version history.
          </p>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? 'Deleting...' : 'Delete Prompt'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
