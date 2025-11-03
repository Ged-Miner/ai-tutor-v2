'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createSystemPromptSchema } from '@/lib/validations/system-prompt';
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
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, AlertTriangle } from 'lucide-react';

type PromptFormInput = {
  name: string;
  content: string;
  isActive?: boolean;
};

interface PromptFormModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PromptFormModal({ isOpen, onClose }: PromptFormModalProps) {
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
  } = useForm<PromptFormInput>({
    resolver: zodResolver(createSystemPromptSchema),
    defaultValues: {
      name: '',
      content: '',
      isActive: true,
    },
  });

  const nameValue = watch('name');
  const isActiveValue = watch('isActive');

  // Check if this will be a tutor prompt and if it will deactivate others
  useEffect(() => {
    if (nameValue && nameValue.includes('tutor') && isActiveValue) {
      setWillDeactivateOthers(true);
    } else {
      setWillDeactivateOthers(false);
    }
  }, [nameValue, isActiveValue]);

  // Handle form submission
  const onSubmit = async (data: PromptFormInput) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/admin/prompts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create prompt');
      }

      // Success - close modal and refresh page
      reset();
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
    reset();
    setError(null);
    setWillDeactivateOthers(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Create System Prompt</DialogTitle>
          <DialogDescription>
            Add a new system prompt for the AI. The name must be unique and use lowercase letters, numbers, and underscores.
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
                <strong>Note:</strong> Creating an active tutor prompt will automatically deactivate all other active tutor prompts.
              </AlertDescription>
            </Alert>
          )}

          {/* Name Field */}
          <div className="space-y-2">
            <Label htmlFor="name">Prompt Name *</Label>
            <Input
              {...register('name')}
              id="name"
              placeholder="default_tutor_prompt"
              className={errors.name ? 'border-destructive' : ''}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
            <p className="text-xs text-muted-foreground">
              Use lowercase letters, numbers, and underscores only. Include &quot;tutor&quot; in the name if this is a tutor prompt.
            </p>
          </div>

          {/* Content Field */}
          <div className="space-y-2">
            <Label htmlFor="content">Prompt Content *</Label>
            <Textarea
              {...register('content')}
              id="content"
              rows={12}
              placeholder="You are a helpful AI tutor assistant..."
              className={errors.content ? 'border-destructive' : ''}
            />
            {errors.content && (
              <p className="text-sm text-destructive">{errors.content.message}</p>
            )}
            <p className="text-xs text-muted-foreground">
              This prompt will guide the AI&apos;s behavior and responses.
            </p>
          </div>

          {/* Active Status Field */}
          <div className="flex items-center space-x-2">
            <input
              {...register('isActive')}
              type="checkbox"
              id="isActive"
              className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
              defaultChecked
            />
            <Label htmlFor="isActive" className="text-sm font-normal cursor-pointer">
              Set as active (only one tutor prompt can be active at a time)
            </Label>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Creating...' : 'Create Prompt'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
