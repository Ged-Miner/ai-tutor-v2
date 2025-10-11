'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createUserSchema, type CreateUserInput } from '@/lib/validations/user';
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
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

interface UserFormModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function UserFormModal({ isOpen, onClose }: UserFormModalProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isGeneratingCode, setIsGeneratingCode] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<CreateUserInput>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      email: '',
      name: '',
      password: '',
      role: 'STUDENT',
      teacherCode: null,
    },
  });

  const selectedRole = watch('role');

  // Generate teacher code
  const handleGenerateCode = async () => {
    setIsGeneratingCode(true);
    try {
      const response = await fetch('/api/admin/generate-teacher-code');
      if (!response.ok) throw new Error('Failed to generate code');

      const data = await response.json();
      setValue('teacherCode', data.teacherCode);
    } catch (err) {
      setError('Failed to generate teacher code');
    } finally {
      setIsGeneratingCode(false);
    }
  };

  // Handle form submission
  const onSubmit = async (data: CreateUserInput) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create user');
      }

      // Success - close modal and refresh page
      reset();
      onClose();
      router.refresh(); // Revalidate server component data
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
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create New User</DialogTitle>
          <DialogDescription>
            Add a new user to the system. Fill in all required fields.
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

          {/* Name Field */}
          <div className="space-y-2">
            <Label htmlFor="name">Full Name *</Label>
            <Input
              {...register('name')}
              id="name"
              placeholder="John Smith"
              className={errors.name ? 'border-destructive' : ''}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          {/* Email Field */}
          <div className="space-y-2">
            <Label htmlFor="email">Email Address *</Label>
            <Input
              {...register('email')}
              type="email"
              id="email"
              placeholder="john@example.com"
              className={errors.email ? 'border-destructive' : ''}
            />
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email.message}</p>
            )}
          </div>

          {/* Password Field */}
          <div className="space-y-2">
            <Label htmlFor="password">Password *</Label>
            <Input
              {...register('password')}
              type="password"
              id="password"
              placeholder="Min. 8 characters"
              className={errors.password ? 'border-destructive' : ''}
            />
            {errors.password && (
              <p className="text-sm text-destructive">{errors.password.message}</p>
            )}
          </div>

          {/* Role Field */}
          <div className="space-y-2">
            <Label htmlFor="role">Role *</Label>
            <select
              {...register('role')}
              id="role"
              className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
                errors.role ? 'border-destructive' : ''
              }`}
            >
              <option value="STUDENT">Student</option>
              <option value="TEACHER">Teacher</option>
              <option value="ADMIN">Admin</option>
            </select>
            {errors.role && (
              <p className="text-sm text-destructive">{errors.role.message}</p>
            )}
          </div>

          {/* Teacher Code Field (conditional) */}
          {selectedRole === 'TEACHER' && (
            <div className="space-y-2">
              <Label htmlFor="teacherCode">Teacher Code *</Label>
              <div className="flex gap-2">
                <Input
                  {...register('teacherCode')}
                  id="teacherCode"
                  placeholder="TEACH001"
                  className={errors.teacherCode ? 'border-destructive' : ''}
                />
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleGenerateCode}
                  disabled={isGeneratingCode}
                >
                  {isGeneratingCode ? 'Generating...' : 'Generate'}
                </Button>
              </div>
              {errors.teacherCode && (
                <p className="text-sm text-destructive">{errors.teacherCode.message}</p>
              )}
              <p className="text-xs text-muted-foreground">
                Format: TEACH### (e.g., TEACH001)
              </p>
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Creating...' : 'Create User'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
