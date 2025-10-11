'use client';

import { useState } from 'react';
import UserFormModal from './user-form-modal';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

export default function CreateUserButton() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setIsModalOpen(true)}>
        <Plus className="h-4 w-4 mr-2" />
        Create User
      </Button>

      <UserFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}
