'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { updateUserSchema, type UpdateUserInput } from '@/lib/validations/user';
import { useRouter } from 'next/navigation';
import { Prisma } from '@prisma/client';

interface User {
  id: string;
  email: string;
  name: string | null;
  role: 'ADMIN' | 'TEACHER' | 'STUDENT';
  teacherCode: string | null;
}

interface EditUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
}

export default function EditUserModal({ isOpen, onClose, user }: EditUserModalProps) {
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
  } = useForm<UpdateUserInput>({
    resolver: zodResolver(updateUserSchema),
  });

  const selectedRole = watch('role');

  // Reset form when user changes or modal opens
  useEffect(() => {
    if (user && isOpen) {
      reset({
        email: user.email,
        name: user.name || '',
        role: user.role,
        teacherCode: user.teacherCode,
        password: '', // Don't pre-fill password
      });
    }
  }, [user, isOpen, reset]);

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
  const onSubmit = async (data: UpdateUserInput) => {
    if (!user) return;

    setIsSubmitting(true);
    setError(null);

    try {
      // Build update object with only changed fields
      const updatePayload: Prisma.UserUpdateInput = {
        ...(data.email && data.email !== user.email && { email: data.email }),
        ...(data.name && data.name !== user.name && { name: data.name }),
        ...(data.password && { password: data.password }),
        ...(data.role && data.role !== user.role && { role: data.role }),
        ...(data.teacherCode !== undefined && data.teacherCode !== user.teacherCode && {
          teacherCode: data.teacherCode
        }),
      };

      const response = await fetch(`/api/admin/users/${user.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatePayload),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to update user');
      }

      // Success - close modal and refresh page
      handleClose();
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
    onClose();
  };

  if (!isOpen || !user) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4">
          <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Edit User</h3>
                <p className="text-sm text-gray-500 mt-1">{user.email}</p>
              </div>
              <button
                onClick={handleClose}
                className="text-gray-400 hover:text-gray-500 transition-colors"
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
              {/* Error Alert */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-md p-4">
                  <div className="flex">
                    <svg className="h-5 w-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div className="ml-3">
                      <p className="text-sm text-red-800">{error}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Name Field */}
              <div>
                <label htmlFor="edit-name" className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <input
                  {...register('name')}
                  type="text"
                  id="edit-name"
                  className={`w-full text-gray-500 px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.name ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="John Smith"
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                )}
              </div>

              {/* Email Field */}
              <div>
                <label htmlFor="edit-email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <input
                  {...register('email')}
                  type="email"
                  id="edit-email"
                  className={`w-full text-gray-500 px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.email ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="john@example.com"
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                )}
              </div>

              {/* Password Field */}
              <div>
                <label htmlFor="edit-password" className="block text-sm font-medium text-gray-700 mb-1">
                  New Password
                </label>
                <input
                  {...register('password')}
                  type="password"
                  id="edit-password"
                  className={`w-full text-gray-500 px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.password ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Leave blank to keep current password"
                />
                {errors.password && (
                  <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
                )}
                <p className="mt-1 text-xs text-gray-500">
                  Leave blank to keep the current password
                </p>
              </div>

              {/* Role Field */}
              <div>
                <label htmlFor="edit-role" className="block text-sm font-medium text-gray-700 mb-1">
                  Role
                </label>
                <select
                  {...register('role')}
                  id="edit-role"
                  className={`w-full text-gray-500 px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.role ? 'border-red-300' : 'border-gray-300'
                  }`}
                >
                  <option value="STUDENT">Student</option>
                  <option value="TEACHER">Teacher</option>
                  <option value="ADMIN">Admin</option>
                </select>
                {errors.role && (
                  <p className="mt-1 text-sm text-red-600">{errors.role.message}</p>
                )}
              </div>

              {/* Teacher Code Field (conditional) */}
              {selectedRole === 'TEACHER' && (
                <div>
                  <label htmlFor="edit-teacherCode" className="block text-sm font-medium text-gray-700 mb-1">
                    Teacher Code
                  </label>
                  <div className="flex space-x-2">
                    <input
                      {...register('teacherCode')}
                      type="text"
                      id="edit-teacherCode"
                      className={`flex-1 text-gray-500 px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.teacherCode ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="TEACH001"
                    />
                    <button
                      type="button"
                      onClick={handleGenerateCode}
                      disabled={isGeneratingCode}
                      className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md text-sm font-medium transition-colors disabled:opacity-50"
                    >
                      {isGeneratingCode ? 'Generating...' : 'Generate'}
                    </button>
                  </div>
                  {errors.teacherCode && (
                    <p className="mt-1 text-sm text-red-600">{errors.teacherCode.message}</p>
                  )}
                  <p className="mt-1 text-xs text-gray-500">
                    Format: TEACH### (e.g., TEACH001)
                  </p>
                </div>
              )}

              {/* Footer Buttons */}
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
