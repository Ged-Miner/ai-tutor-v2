'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  updateLessonSchema,
  type UpdateLessonInput,
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

interface EditLessonModalProps {
  lesson: {
    id: string;
    title: string;
    rawTranscript: string;
    summary: string | null;
    customPrompt: string | null;
  };
  courseId: string;
  onClose: () => void;
}

export function EditLessonModal({
  lesson,
  courseId,
  onClose,
}: EditLessonModalProps) {
  const router = useRouter();
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<UpdateLessonInput>({
    resolver: zodResolver(updateLessonSchema),
    defaultValues: {
      title: lesson.title,
      rawTranscript: lesson.rawTranscript,
      summary: lesson.summary || '',
      customPrompt: lesson.customPrompt || '',
    },
  });

  const onSubmit = async (data: UpdateLessonInput) => {
    setIsSubmitting(true);
    setError('');

    try {
      const response = await fetch(
        `/api/teacher/courses/${courseId}/lessons/${lesson.id}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update lesson');
      }

      router.refresh();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update lesson');
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Lesson</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Lesson Title */}
          <div className="space-y-2">
            <Label htmlFor="title">
              Lesson Title <span className="text-red-500">*</span>
            </Label>
            <Input id="title" {...register('title')} />
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
              className="font-mono text-sm"
            />
            {errors.rawTranscript && (
              <p className="text-sm text-red-600">
                {errors.rawTranscript.message}
              </p>
            )}
          </div>

          {/* Summary */}
          <div className="space-y-2">
            <Label htmlFor="summary">Summary</Label>
            <Textarea id="summary" {...register('summary')} rows={4} />
            {errors.summary && (
              <p className="text-sm text-red-600">{errors.summary.message}</p>
            )}
          </div>

          {/* Custom Prompt */}
          <div className="space-y-2">
            <Label htmlFor="customPrompt">Custom AI Prompt</Label>
            <Textarea id="customPrompt" {...register('customPrompt')} rows={3} />
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
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
