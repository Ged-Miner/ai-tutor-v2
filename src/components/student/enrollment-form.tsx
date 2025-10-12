'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  enrollmentSchema,
  type EnrollmentInput,
} from '@/lib/validations/enrollment';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { EnrollmentResponse, ApiError } from '@/types/api';

export function EnrollmentForm() {
  const router = useRouter();
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<EnrollmentInput>({
    resolver: zodResolver(enrollmentSchema),
  });

  const onSubmit = async (data: EnrollmentInput) => {
    setIsSubmitting(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/student/enroll', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      // Type the response properly
      const result: EnrollmentResponse | ApiError = await response.json();

      if (!response.ok) {
        // Type guard: check if it's an error response
        if ('error' in result) {
          throw new Error(result.error);
        }
        throw new Error('Failed to enroll');
      }

      // Type guard: ensure it's a successful enrollment response
      if (!('success' in result)) {
        throw new Error('Invalid response from server');
      }

      // Check if already enrolled
      if (result.alreadyEnrolled) {
        setSuccess(result.message);
        setIsSubmitting(false);
        return;
      }

      // Success - show courses enrolled (now properly typed!)
      const courseNames = result.courses.map(course => course.name).join(', ');
      setSuccess(
        `✅ ${result.message}\n\nCourses: ${courseNames}`
      );
      reset();

      // Redirect to courses after 2 seconds
      setTimeout(() => {
        router.push('/student/courses');
        router.refresh();
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to enroll');
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Enter Teacher Code</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Teacher Code Input */}
          <div className="space-y-2">
            <Label htmlFor="teacherCode">
              Teacher Code <span className="text-red-500">*</span>
            </Label>
            <Input
              id="teacherCode"
              {...register('teacherCode')}
              placeholder="TEACH001"
              className="text-center text-lg font-mono uppercase tracking-wider"
              maxLength={8}
            />
            <p className="text-xs text-muted-foreground">
              Format: TEACH followed by 3 digits (e.g., TEACH001)
            </p>
            {errors.teacherCode && (
              <p className="text-sm text-red-600">
                {errors.teacherCode.message}
              </p>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Success Message */}
          {success && (
            <Alert className="border-green-500 bg-green-50">
              <AlertDescription className="whitespace-pre-line text-green-800">
                {success}
              </AlertDescription>
            </Alert>
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full"
            size="lg"
          >
            {isSubmitting ? 'Enrolling...' : 'Enroll Now'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
