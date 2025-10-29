'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import type { Course, PendingTranscript } from '@/types/transcript';

type ProcessTranscriptModalProps = {
  transcript: PendingTranscript;
  onClose: () => void;
  onSuccess: () => void;
};

const processSchema = z.object({
  courseId: z.string().min(1, 'Please select a course'),
  customTitle: z.string().optional(),
});

type ProcessFormData = z.infer<typeof processSchema>;

export function ProcessTranscriptModal({
  transcript,
  onClose,
  onSuccess,
}: ProcessTranscriptModalProps) {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const form = useForm<ProcessFormData>({
    resolver: zodResolver(processSchema),
    defaultValues: {
      courseId: transcript.suggestedCourse?.id || '',
      customTitle: transcript.lessonTitle,
    },
  });

  // Fetch teacher's courses
  useEffect(() => {
    async function fetchCourses() {
      try {
        const response = await fetch('/api/teacher/courses');
        if (response.ok) {
          const data = await response.json();
          setCourses(data);
        }
      } catch (err) {
        console.error('Error fetching courses:', err);
      }
    }
    fetchCourses();
  }, []);

  const onSubmit = async (data: ProcessFormData) => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch(
        `/api/teacher/pending-transcripts/${transcript.id}/process`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to process transcript');
      }

      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Create Lesson from Transcript</DialogTitle>
          <DialogDescription>
            Select the course for this lesson and optionally customize the title.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <p className="text-sm">
                <strong>Course from Extension:</strong> {transcript.courseName}
              </p>
              <p className="text-sm">
                <strong>Captured:</strong>{' '}
                {new Date(transcript.capturedAt).toLocaleString()}
              </p>
            </div>

            <FormField
              control={form.control}
              name="courseId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Select Course</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a course" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {courses.map((course) => (
                        <SelectItem key={course.id} value={course.id}>
                          {course.name}
                          {course.id === transcript.suggestedCourse?.id &&
                            ' (Suggested)'}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="customTitle"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Lesson Title (Optional)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={transcript.lessonTitle}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Creating...' : 'Create Lesson'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
