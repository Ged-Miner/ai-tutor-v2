'use client';

import { useState } from 'react';
import { LessonFormModal } from './lesson-form-modal';
import { Button } from '@/components/ui/button';

interface CreateLessonButtonProps {
  courseId: string;
}

export function CreateLessonButton({ courseId }: CreateLessonButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setIsOpen(true)}>
        <svg
          className="-ml-1 mr-2 h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 4v16m8-8H4"
          />
        </svg>
        Create Lesson
      </Button>

      {isOpen && (
        <LessonFormModal courseId={courseId} onClose={() => setIsOpen(false)} />
      )}
    </>
  );
}
