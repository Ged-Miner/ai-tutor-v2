'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  createLessonSchema,
  type CreateLessonInput,
} from '@/lib/validations/lesson';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface LessonFormModalProps {
  courseId: string;
  onClose: () => void;
}

export function LessonFormModal({ courseId, onClose }: LessonFormModalProps) {
  const router = useRouter();
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateLessonInput>({
    resolver: zodResolver(createLessonSchema),
  });

  const onSubmit = async (data: CreateLessonInput) => {
    setIsSubmitting(true);
    setError('');

    try {
      const response = await fetch(`/api/teacher/courses/${courseId}/lessons`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create lesson');
      }

      router.refresh();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create lesson');
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Lesson</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Lesson Title */}
          <div className="space-y-2">
            <Label htmlFor="title">
              Lesson Title <span className="text-red-500">*</span>
            </Label>
            <Input
              id="title"
              {...register('title')}
              placeholder="Introduction to Thermodynamics"
            />
            {errors.title && (
              <p className="text-sm text-red-600">{errors.title.message}</p>
            )}
          </div>

          {/* Raw Transcript */}
          <div className="space-y-2">
            <Label htmlFor="rawTranscript">
              Lesson Transcript <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="rawTranscript"
              {...register('rawTranscript')}
              rows={10}
              placeholder="Paste the lesson transcript here... (This will later come automatically from the Chrome extension)"
              className="font-mono text-sm"
            />
            <p className="text-xs text-muted-foreground">
              For now, paste lesson content manually. Later this will be
              automatically captured from your Google Doc.
            </p>
            {errors.rawTranscript && (
              <p className="text-sm text-red-600">
                {errors.rawTranscript.message}
              </p>
            )}
          </div>

          {/* Summary (Optional) */}
          <div className="space-y-2">
            <Label htmlFor="summary">Summary (Optional)</Label>
            <Textarea
              id="summary"
              {...register('summary')}
              rows={4}
              placeholder="A brief summary of the lesson... (Will be AI-generated in the future)"
            />
            <p className="text-xs text-muted-foreground">
              Optional for now. Later, AI will automatically generate summaries.
            </p>
            {errors.summary && (
              <p className="text-sm text-red-600">{errors.summary.message}</p>
            )}
          </div>

          {/* Custom Prompt (Optional) */}
          <div className="space-y-2">
            <Label htmlFor="customPrompt">
              Custom AI Prompt (Optional - Advanced)
            </Label>
            <Textarea
              id="customPrompt"
              {...register('customPrompt')}
              rows={3}
              placeholder="Custom instructions for the AI tutor for this specific lesson..."
            />
            <p className="text-xs text-muted-foreground">
              Override the default AI behavior for this lesson. Leave blank to
              use your course defaults.
            </p>
            {errors.customPrompt && (
              <p className="text-sm text-red-600">
                {errors.customPrompt.message}
              </p>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Buttons */}
          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Creating...' : 'Create Lesson'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
