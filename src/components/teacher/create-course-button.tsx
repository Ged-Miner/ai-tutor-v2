'use client';

import { useState } from 'react';
import { CourseFormModal } from './course-form-modal';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

export function CreateCourseButton() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setIsOpen(true)}>
        <Plus className="h-4 w-4 mr-2" />
        Create Course
      </Button>

      <CourseFormModal open={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}
