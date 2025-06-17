// DragDrop.tsx
'use client';

import {
  DndContext,
  closestCenter,
  DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import React from 'react';

export default function DragDrop({
  children,
  onDragEnd,
  disabled = false
}: {
  children: React.ReactNode;
  onDragEnd: (event: DragEndEvent) => void;
  disabled?: boolean
}) {
   const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: disabled
        ? { distance: 99999 } // effectively disables it
        : undefined,
    })
  );

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={onDragEnd}
    >
      {children}
    </DndContext>
  );
}
