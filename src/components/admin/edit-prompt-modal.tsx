'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { updateSystemPromptSchema, type UpdateSystemPromptInput } from '@/lib/validations/system-prompt';
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
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface SystemPrompt {
  id: string;
  name: string;
  content: string;
  version: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface EditPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  prompt: SystemPrompt | null;
}

export default function EditPromptModal({ isOpen, onClose, prompt }: EditPromptModalProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [willDeactivateOthers, setWillDeactivateOthers] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<UpdateSystemPromptInput>({
    resolver: zodResolver(updateSystemPromptSchema),
  });

  const isActiveValue = watch('isActive');

  // Check if this is a tutor prompt and if activating it will deactivate others
  useEffect(() => {
    if (prompt && isActiveValue && prompt.name.includes('tutor')) {
      setWillDeactivateOthers(true);
    } else {
      setWillDeactivateOthers(false);
    }
  }, [isActiveValue, prompt]);

  // Reset form when prompt changes
  useEffect(() => {
    if (prompt) {
      reset({
        content: prompt.content,
        isActive: prompt.isActive,
      });
    }
  }, [prompt, reset]);

  // Handle form submission
  const onSubmit = async (data: UpdateSystemPromptInput) => {
    if (!prompt) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch(`/api/admin/prompts/${prompt.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to update prompt');
      }

      // Success - close modal and refresh page
      onClose();
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Close and reset form
  const handleClose = () => {
    setError(null);
    setWillDeactivateOthers(false);
    onClose();
  };

  if (!prompt) return null;

  const isTutorPrompt = prompt.name.includes('tutor');

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-150 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit System Prompt</DialogTitle>
          <DialogDescription>
            Update the content and status of this system prompt. The version will automatically increment.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Error Alert */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Auto-deactivation Warning */}
          {willDeactivateOthers && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>Note:</strong> Activating this tutor prompt will automatically deactivate all other active tutor prompts.
              </AlertDescription>
            </Alert>
          )}

          {/* Prompt Info */}
          <div className="rounded-lg bg-muted p-4 space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium">Name</div>
                <div className="text-sm text-muted-foreground">{prompt.name}</div>
              </div>
              <div className="flex gap-2">
                <Badge variant="outline">v{prompt.version}</Badge>
                {isTutorPrompt && (
                  <Badge variant="secondary">Tutor</Badge>
                )}
              </div>
            </div>
            <div className="text-xs text-muted-foreground">
              Last updated: {new Date(prompt.updatedAt).toLocaleString()}
            </div>
          </div>

          {/* Content Field */}
          <div className="space-y-2">
            <Label htmlFor="content">Prompt Content *</Label>
            <Textarea
              {...register('content')}
              id="content"
              rows={8} /* reduced from 12 */
              placeholder="Enter the system prompt content..."
              className={errors.content ? 'border-destructive' : ''}
            />
            {errors.content && (
              <p className="text-sm text-destructive">{errors.content.message}</p>
            )}
            <p className="text-xs text-muted-foreground">
              This prompt will be used by the AI to generate responses.
            </p>
          </div>

          {/* Active Status Field */}
          <div className="flex items-center space-x-2">
            <input
              {...register('isActive')}
              type="checkbox"
              id="isActive"
              className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
            />
            <Label htmlFor="isActive" className="text-sm font-normal cursor-pointer">
              Active {isTutorPrompt && '(only one tutor prompt can be active at a time)'}
            </Label>
          </div>
          {errors.isActive && (
            <p className="text-sm text-destructive">{errors.isActive.message}</p>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
