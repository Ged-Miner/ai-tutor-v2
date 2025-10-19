'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { CourseFormModal } from './course-form-modal';

export function CreateCourseButton() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setIsModalOpen(true)}>
        Create Course
      </Button>
      <CourseFormModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}
