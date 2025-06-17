'use client';

import { useDroppable } from '@dnd-kit/core';

export default function DroppableArea({
  id,
  children,
}: {
  id: string;
  children: React.ReactNode;
}) {
  const { setNodeRef, isOver } = useDroppable({ id });

  return (
    <div
      ref={setNodeRef}
      className={`w-full h-6 rounded  ${
        isOver ? 'bg-green-100 border-green-500' : ''
      }`}
    >
      {children}
    </div>
  );
}
