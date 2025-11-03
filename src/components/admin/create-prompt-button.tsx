'use client';

import { useState } from 'react';
import PromptFormModal from './prompt-form-modal';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

export default function CreatePromptButton() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setIsModalOpen(true)} className="gap-2">
        <Plus className="h-4 w-4" />
        Create Prompt
      </Button>

      <PromptFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}
