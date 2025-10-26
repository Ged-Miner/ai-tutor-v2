'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { CourseFormModal } from './course-form-modal';
import { Plus } from 'lucide-react';

export function CreateCourseButton() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setIsModalOpen(true)}>
        <Plus className="h-4 w-4 mr-2" />
        Create Course
      </Button>
      <CourseFormModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}
